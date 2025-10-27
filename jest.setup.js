// import '@testing-library/jest-dom';

// Mock Firebase
global.jest = {
  mock: () => {},
};

const mockFirebase = {
  auth: {},
  db: {},
  storage: {},
};

// Mock localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
global.localStorage = localStorageMock;
