
class User {
  static users = []; 

  static async create(data) {
    const newUser = { id: String(this.users.length + 1), ...data };
    this.users.push(newUser);
    return newUser;
  }

  static async findOne(query) {
    if (query.email) {
      return this.users.find(u => u.email === query.email) || null;
    }
    return null;
  }

  static async clearAll() {
    this.users = [];
  }
}

module.exports = User;
