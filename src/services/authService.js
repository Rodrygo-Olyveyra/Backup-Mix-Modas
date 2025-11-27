const User = require('../models/user');

class AuthService {
  static async register({ name, email, password }) {
    // validações básicas
    if (!email) {
      throw new Error('Email é obrigatório');
    }
    if (!password) {
      throw new Error('Senha é obrigatória');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const user = await User.create({ name, email, password });
    return user;
  }

  static async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Credenciais inválidas');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isValid = await this.comparePassword(password, user.password);
    if (!isValid) {
      throw new Error('Credenciais inválidas');
    }

    // mock de JWT apenas para os testes
    return { token: 'mocked-jwt-token' };
  }

  static async comparePassword(input, stored) {
    return input === stored;
  }
}

module.exports = AuthService;
