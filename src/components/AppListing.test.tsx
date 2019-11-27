import React from 'react';
import { render } from '@testing-library/react'
import { AppListing } from './AppListing';
import { Listing, Modes } from '../availableApps';
import { schema, acl } from 'rdf-namespaces';

jest.mock('@solid/react', () => ({
  LoggedOut: () => null,
  LoggedIn: 'div',
  useWebId: jest.fn().mockReturnValue('https://arbitrary-webid.com'),
}));

it('tells the user when no special permissions are required', () => {
  const listing: Listing = {
    launchUrl: 'https://example.com',
    name: 'Mock app listing',
    tagline: 'Mock tagline',
  };
  const { container } = render(<AppListing listing={listing}/>);
  expect(container.textContent).toMatch('This app does not require special permissions.');
});

describe('with permission requests for a specific class of data', () => {
  function getMockListing(requiredModes: Modes[]) {
    const listing: Listing = {
      launchUrl: 'https://example.com',
      name: 'Mock app listing',
      tagline: 'Mock tagline',
      requirements: [
        {
          forClass: schema.Movie,
          defaultFilename: 'movies',
          requiredModes: requiredModes,
        }
      ],
    };
    return listing;
  }

  it('tells the user when only read permissions are required', () => {
    const listing = getMockListing([acl.Read]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('tells the user when only append permissions are required', () => {
    const listing = getMockListing([acl.Append]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('tells the user when only write permissions are required', () => {
    const listing = getMockListing([acl.Write]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('tells the user when only control permissions are required', () => {
    const listing = getMockListing([acl.Control]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('renders (effectively equal) plain Write and Append+Write permissions in the same way', () => {
    const writeContainer = document.createElement('div');
    const writeListing = getMockListing([acl.Write]);
    const writeRender = render(<AppListing listing={writeListing}/>, { container: writeContainer });
    const writeRequirements = writeRender.getAllByRole('listitem');

    const appendAndWriteContainer = document.createElement('div');
    const appendAndWriteListing = getMockListing([acl.Append, acl.Write]);
    const appendAndWriteRender = render(<AppListing listing={appendAndWriteListing}/>, { container: appendAndWriteContainer });
    const appendAndWriteRequirements = appendAndWriteRender.getAllByRole('listitem');

    expect(writeRequirements).toEqual(appendAndWriteRequirements);
  });

  it('correctly lists all requested permissions when combined', () => {
    const listing = getMockListing([acl.Read, acl.Append, acl.Write, acl.Control]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('shows a friendlier alias for `http://www.w3.org/2002/01/bookmark#Bookmark`', () => {
    const listing: Listing = {
      launchUrl: 'https://example.com',
      name: 'Mock app listing',
      tagline: 'Mock tagline',
      requirements: [
        {
          forClass: 'http://www.w3.org/2002/01/bookmark#Bookmark',
          defaultFilename: 'bookmarks',
          requiredModes: [acl.Read],
        }
      ],
    };
    const { getByRole, getByTitle } = render(<AppListing listing={listing}/>);
    expect(getByRole('listitem').textContent).toBe('Read bookmarks in your Pod.');
    expect(getByTitle('http://www.w3.org/2002/01/bookmark#Bookmark').textContent).toBe('bookmarks');
  });

  it('shows a friendlier alias for `schema:TextDigitalDocument`', () => {
    const listing: Listing = {
      launchUrl: 'https://example.com',
      name: 'Mock app listing',
      tagline: 'Mock tagline',
      requirements: [
        {
          forClass: schema.TextDigitalDocument,
          defaultFilename: 'bookmarks',
          requiredModes: [acl.Read],
        }
      ],
    };
    const { getByRole, getByTitle } = render(<AppListing listing={listing}/>);
    expect(getByRole('listitem').textContent).toBe('Read text files in your Pod.');
    expect(getByTitle(schema.TextDigitalDocument).textContent).toBe('text files');
  });
});

describe('with permission requests for a specific folder', () => {
  function getMockListing(requiredModes: Modes[]) {
    const listing: Listing = {
      launchUrl: 'https://example.com',
      name: 'Mock app listing',
      tagline: 'Mock tagline',
      requirements: [
        {
          container: 'arbitrary-container',
          requiredModes: requiredModes,
        }
      ],
    };
    return listing;
  }

  it('tells the user when only read permissions are required', () => {
    const listing = getMockListing([acl.Read]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('tells the user when only append permissions are required', () => {
    const listing = getMockListing([acl.Append]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('tells the user when only write permissions are required', () => {
    const listing = getMockListing([acl.Write]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('tells the user when only control permissions are required', () => {
    const listing = getMockListing([acl.Control]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('renders (effectively equal) plain Write and Append+Write permissions in the same way', () => {
    const writeContainer = document.createElement('div');
    const writeListing = getMockListing([acl.Write]);
    const writeRender = render(<AppListing listing={writeListing}/>, { container: writeContainer });
    const writeRequirements = writeRender.getAllByRole('listitem');

    const appendAndWriteContainer = document.createElement('div');
    const appendAndWriteListing = getMockListing([acl.Append, acl.Write]);
    const appendAndWriteRender = render(<AppListing listing={appendAndWriteListing}/>, { container: appendAndWriteContainer });
    const appendAndWriteRequirements = appendAndWriteRender.getAllByRole('listitem');

    expect(writeRequirements).toEqual(appendAndWriteRequirements);
  });

  it('correctly lists all requested permissions when combined', () => {
    const listing = getMockListing([acl.Read, acl.Append, acl.Write, acl.Control]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });
});

describe('with permission requests for the entire Pod', () => {
  function getMockListing(requiredModes: Modes[]) {
    const listing: Listing = {
      launchUrl: 'https://example.com',
      name: 'Mock app listing',
      tagline: 'Mock tagline',
      requirements: [
        {
          podWidePermissions: requiredModes,
        }
      ],
    };
    return listing;
  }

  it('tells the user when only read permissions are required', () => {
    const listing = getMockListing([acl.Read]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('tells the user when only append permissions are required', () => {
    const listing = getMockListing([acl.Append]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('tells the user when only write permissions are required', () => {
    const listing = getMockListing([acl.Write]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('tells the user when only control permissions are required', () => {
    const listing = getMockListing([acl.Control]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('renders (effectively equal) plain Write and Append+Write permissions in the same way', () => {
    const writeContainer = document.createElement('div');
    const writeListing = getMockListing([acl.Write]);
    const writeRender = render(<AppListing listing={writeListing}/>, { container: writeContainer });
    const writeRequirements = writeRender.getAllByRole('listitem');

    const appendAndWriteContainer = document.createElement('div');
    const appendAndWriteListing = getMockListing([acl.Append, acl.Write]);
    const appendAndWriteRender = render(<AppListing listing={appendAndWriteListing}/>, { container: appendAndWriteContainer });
    const appendAndWriteRequirements = appendAndWriteRender.getAllByRole('listitem');

    expect(writeRequirements).toEqual(appendAndWriteRequirements);
  });

  it('correctly lists all requested permissions when combined', () => {
    const listing = getMockListing([acl.Read, acl.Append, acl.Write, acl.Control]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });
});

describe('with mixed types of permission requests', () => {
  function getMockListing(requiredPodWideModes: Modes[], requiredContainerModes: Modes[]) {
    const listing: Listing = {
      launchUrl: 'https://example.com',
      name: 'Mock app listing',
      tagline: 'Mock tagline',
      requirements: [
        {
          podWidePermissions: requiredPodWideModes,
        },
        {
          container: 'arbitrary-container',
          requiredModes: requiredContainerModes,
        }
      ],
    };
    return listing;
  }

  it('tells the user when only one mode for every type of permission is required', () => {
    const listing = getMockListing([acl.Read], [acl.Append]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });

  it('tells the user when multiple modes are required', () => {
    const listing = getMockListing([acl.Read], [acl.Read, acl.Write, acl.Control]);
    const { getAllByRole } = render(<AppListing listing={listing}/>);
    const requirements = getAllByRole('listitem');
    expect(requirements).toMatchSnapshot();
  });
});
