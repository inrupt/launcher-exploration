import { getDocument } from './documentCache';

jest.mock('tripledoc', () => ({ fetchDocument: jest.fn(() => new Promise(() => undefined) )}));

beforeEach(() => {
  // Unfortunate the `clearMocks` config option is not available in Create React App:
  jest.clearAllMocks();
});

describe('getDocument', () => {
  it('should send just one HTTP Request for a Document that was requested twice', () => {
    const fetchDocument: jest.Mock = require.requireMock('tripledoc').fetchDocument;
    getDocument('https://arbitrary-url-for-one-request.com');
    getDocument('https://arbitrary-url-for-one-request.com');
    expect(fetchDocument.mock.calls.length).toBe(1);
  });

  it('should not send another HTTP request if one was already resolved', async () => {
    const fetchDocument: jest.Mock = require.requireMock('tripledoc').fetchDocument;
    fetchDocument.mockReturnValueOnce(Promise.resolve({}));
    await getDocument('https://arbitrary-url-for-resolved-request.com');
    await getDocument('https://arbitrary-url-for-resolved-request.com');
    expect(fetchDocument.mock.calls.length).toBe(1);
  });

  it('should still be able to successfully save a Document', async () => {
    const mockSave = jest.fn(() => Promise.resolve({}));
    const fetchDocument: jest.Mock = require.requireMock('tripledoc').fetchDocument;
    fetchDocument.mockReturnValueOnce(Promise.resolve({ save: mockSave }));

    const docFromCache = await getDocument('https://arbitrary-url-for-saving.com');
    await docFromCache.save();
    expect(mockSave.mock.calls.length).toBe(1);
  });

  it('should update the cache when a Document is saved', async () => {
    const mockSavedDocument = { mock: 'of saved Document' };
    const mockSave = jest.fn(() => Promise.resolve(mockSavedDocument));
    const fetchDocument: jest.Mock = require.requireMock('tripledoc').fetchDocument;
    fetchDocument.mockReturnValueOnce(Promise.resolve({ save: mockSave }));

    const docFromCache = await getDocument('https://arbitrary-url-for-saving-with-cache.com');
    const savedDoc = await docFromCache.save();
    expect(savedDoc).toBe(mockSavedDocument);
    expect(getDocument('https://arbitrary-url-for-saving-with-cache.com')).resolves.toBe(mockSavedDocument);
  });
});
