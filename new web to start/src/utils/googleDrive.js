// Google Drive Integration Utility
// This file handles authentication and file upload to Google Drive

// User's Google Account: kolihashu7@gmail.com
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyCAM8EkaS29SIEf-OMwNCvP2kReXytMtDk';

// Discovery doc for Google Drive API
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];

// Authorization scopes required by the API
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

/**
 * Initialize the Google API client
 */
export const initGoogleApi = async () => {
  return new Promise((resolve, reject) => {
    // Check if gapi is already loaded
    if (window.gapi) {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
          });
          resolve(window.gapi);
        } catch (error) {
          reject(error);
        }
      });
    } else {
      // Load gapi script dynamically
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_API_KEY,
              clientId: GOOGLE_CLIENT_ID,
              discoveryDocs: DISCOVERY_DOCS,
              scope: SCOPES
            });
            resolve(window.gapi);
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    }
  });
};

/**
 * Sign in with Google
 */
export const signInGoogle = async () => {
  try {
    const gapi = await initGoogleApi();
    const authInstance = gapi.auth2.getAuthInstance();
    
    if (!authInstance) {
      throw new Error('Auth instance not initialized');
    }

    const user = await authInstance.signIn();
    return {
      email: user.getBasicProfile().getEmail(),
      name: user.getBasicProfile().getName(),
      imageUrl: user.getBasicProfile().getImageUrl()
    };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign out from Google
 */
export const signOutGoogle = async () => {
  try {
    const gapi = await initGoogleApi();
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signOut();
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Check if user is signed in
 */
export const isSignedIn = async () => {
  try {
    const gapi = await initGoogleApi();
    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  } catch (error) {
    return false;
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  try {
    const gapi = await initGoogleApi();
    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    
    if (user) {
      const profile = user.getBasicProfile();
      return {
        email: profile.getEmail(),
        name: profile.getName(),
        imageUrl: profile.getImageUrl()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Upload file to Google Drive
 * @param {Blob} file - The file to upload
 * @param {string} fileName - The name of the file
 * @param {string} folderPath - The folder path in Google Drive (e.g., "Chamunda_Digital/Customers")
 * @returns {Promise<string>} - The file ID of the uploaded file
 */
export const uploadToGoogleDrive = async (file, fileName, folderPath = 'Chamunda_Digital') => {
  try {
    const gapi = await initGoogleApi();
    
    // Create or get the folder
    const folderId = await getOrCreateFolder(gapi, folderPath);
    
    // Create file metadata
    const metadata = {
      name: fileName,
      parents: [folderId]
    };

    // Upload the file
    const response = await new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
      xhr.setRequestHeader('Authorization', `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`);
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(form);
    });

    return response.id;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

/**
 * Get or create a folder in Google Drive
 */
const getOrCreateFolder = async (gapi, folderPath) => {
  const pathParts = folderPath.split('/');
  let currentParentId = 'root';

  for (const folderName of pathParts) {
    // Try to find existing folder
    const response = await gapi.client.drive.files.list({
      q: `name='${folderName}' and '${currentParentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)'
    });

    if (response.result.files && response.result.files.length > 0) {
      currentParentId = response.result.files[0].id;
    } else {
      // Create new folder
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [currentParentId]
        },
        fields: 'id'
      });
      currentParentId = createResponse.result.id;
    }
  }

  return currentParentId;
};

/**
 * List files in a folder
 */
export const listDriveFiles = async (folderPath = 'Chamunda_Digital') => {
  try {
    const gapi = await initGoogleApi();
    const folderId = await getOrCreateFolder(gapi, folderPath);

    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, createdTime, webViewLink)',
      orderBy: 'createdTime desc'
    });

    return response.result.files || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

/**
 * Delete a file from Google Drive
 */
export const deleteDriveFile = async (fileId) => {
  try {
    const gapi = await initGoogleApi();
    await gapi.client.drive.files.delete({
      fileId: fileId
    });
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

