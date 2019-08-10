const { mongoose, accountSchema } = require('../db/schemas/account/');

const existingAccountModel = mongoose && mongoose.models && mongoose.models.Accounts;
const DbAccount = existingAccountModel || mongoose.model('Accounts', accountSchema);
class Account extends DbAccount {
  constructor(account) {
    super(account);
    const validationError = this.validateSync();
    if (validationError) {
      throw validationError;
    }
  }

  async create() {
    try {
      const newAccount = await this.save();
      return newAccount;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Account;
