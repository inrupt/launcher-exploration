import { createDocument, TripleSubject } from 'tripledoc';
import { schema, rdf, solid } from 'rdf-namespaces';
import { addToTypeIndex } from './addToTypeIndex';

describe('addToTypeIndex', () => {
  it('should properly register a Document with a given type index for a given Class', async () => {
    const mockTypeIndex = createDocument('https://example.com/type-index');
    const mockDocument = createDocument('https://example.com/document-for-class');
    const saveMock = jest.fn((subjects?: TripleSubject[]) => Promise.resolve(mockTypeIndex));
    mockTypeIndex.save = saveMock;

    addToTypeIndex(mockTypeIndex, mockDocument, schema.TextDigitalDocument);
    
    expect(saveMock.mock.calls.length).toBe(1);
    const savedTypeRegistrations = saveMock.mock.calls[0][0];
    const typeReg = savedTypeRegistrations![0];
    const [deletions, additions] = typeReg.getPendingTriples();
    expect(deletions.length).toBe(0);
    expect(additions.length).toBe(3);
    // TODO: Find an ergonomic way to test this that does not rely on the order of additions
    //       (where "ergonomic" = without nested expect.arrayContaining, expect.objectContaining, etc.)
    expect(additions[0].object.value).toBe(solid.TypeRegistration);
    expect(additions[0].object.value).toBe(solid.TypeRegistration);
    expect(additions[1].predicate.value).toBe(solid.instance);
    expect(additions[1].object.value).toBe('https://example.com/document-for-class');
    expect(additions[2].predicate.value).toBe(solid.forClass);
    expect(additions[2].object.value).toBe(schema.TextDigitalDocument);
  });
});
