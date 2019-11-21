import { getDocument } from './documentCache';

jest.mock('tripledoc', () => ({ fetchDocument: jest.fn(() => new Promise(() => undefined) )}));

describe('getDocument', () => {
  it('should send just one HTTP Request for a Document that was requested twice', () => {
    const fetchDocument: jest.Mock = require.requireMock('tripledoc').fetchDocument;
    getDocument('https://arbitrary-url.com');
    getDocument('https://arbitrary-url.com');
    expect(fetchDocument.mock.calls.length).toBe(1);
  });

  it('should not send another HTTP request if one was already resolved', () => {
    const fetchDocument: jest.Mock = require.requireMock('tripledoc').fetchDocument;
    fetchDocument.mockReturnValueOnce(Promise.resolve());
    getDocument('https://arbitrary-url.com');
    getDocument('https://arbitrary-url.com');
    expect(fetchDocument.mock.calls.length).toBe(1);
  });
});
