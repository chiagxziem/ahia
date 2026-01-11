export const authExamples = {
  changePwdValErrs: {
    newPassword: "Too small: expected string to have >=8 characters",
    currentPassword: "Too small: expected string to have >=8 characters",
  },
  emailValErr: {
    email: "Invalid email address",
  },
  uuidValErr: {
    id: "Invalid UUID",
  },
};

export const userExamples = {
  createUserValErrs: {
    name: "Too small: expected string to have >=1 characters",
    email: "Invalid email address",
    role: 'Invalid option: expected one of "user"|"admin"',
  },
  banUserValErrs: {
    userId: "Too small: expected string to have >=1 characters",
    banReason: "Too small: expected string to have >=1 characters",
    banExpiresIn: "Too small: expected number to be >=3600",
  },
  sessionTokenValErrs: {
    sessionToken: "Too small: expected string to have >=1 characters",
  },
  userIdValErrs: {
    userId: "Too small: expected string to have >=1 characters",
  },
  updateUserValErrs: {
    name: "Too small: expected string to have >=1 characters",
    image: "Invalid URL",
  },
};

export const categoriesExamples = {
  createCategoryValErrs: {
    name: "Too small: expected string to have >=1 characters",
  },
};

export const productsExamples = {
  createProductValErrs: {
    name: "Too small: expected string to have >=1 characters",
    description: "Too small: expected string to have >=1 characters",
    price: "Too small: expected string to have >=1 characters",
    stockQuantity: "Expected number, received string",
    sizes: "Sizes must be valid JSON",
    colors: "Colors must be valid JSON",
    categoryIds: "Category IDs must be valid JSON",
    createdBy: "Too small: expected string to have >=1 characters",
  },
};

export const cartExamples = {
  addToCartValErrs: {
    productId: "Invalid UUID",
    quantity: "Too small: expected number to be >=1",
  },
  updateCartItemValErrs: {
    quantity: "Too small: expected number to be >=1",
  },
};
