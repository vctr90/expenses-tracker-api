const { mongoose, userSchema } = require('../db/schemas/user/');
const { getDbModel } = require('../lib/db-helper');

const constants = require('../constants');
const {
  addPasswordEncryptionPreSaveHook
} = require('../db/schemas/user/utils.js');

addPasswordEncryptionPreSaveHook({ schema: userSchema, fieldToHash: 'password' });
const DbUser = getDbModel({
  db: mongoose,
  modelName: constants.MODEL_NAMES.USER,
  schema: userSchema
});

class CustomError extends Error {
  constructor({ name, message }) {
    super();
    this.name = name;
    this.message = message;
  }
}

class User extends DbUser {
  constructor(user) {
    super(user);
    if (user) {
      const validationError = this.validateSync();
      if (validationError) {
        throw validationError;
      }
    }
  }

  async create() {
    try {
      const isEmailDuplicated = await this.getIsEmailDuplicated();
      if (isEmailDuplicated) {
        throw new CustomError({ name: 'duplicationError', message: 'Duplicated user' });
      } else {
        const newUser = await this.save();
        return newUser;
      }
    } catch (error) {
      throw error;
    }
  }

  async getIsEmailDuplicated() {
    try {
      const foundUsers = await User.getByEmail({ email: this.email });
      return foundUsers;
    } catch (error) {
      throw error;
    }
  }

  static async getByEmail({ email }, projection = '-password') {
    try {
      const foundUsers = await this.model(constants.MODEL_NAMES.USER)
        .find({ email }, projection).exec();
      return foundUsers.find(foundUser => foundUser.email === email);
    } catch (error) {
      throw error;
    }
  }

  static getByEmailWithPassword({ email }) {
    return User.getByEmail({ email }, '');
  }

  async updateRecord(selector, update) {
    try {
      return this.updateOne(selector, update).query();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
