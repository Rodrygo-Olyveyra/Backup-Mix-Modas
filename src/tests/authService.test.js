const authService = require('../services/authService');
const User = require('../models/user');

describe('Auth Service', () => {
  beforeEach(() => {
    // Garante que os métodos estão resetados entre os testes
    jest.restoreAllMocks();
  });

  // ---------- TESTES ORIGINAIS ----------
  describe('Cadastro de usuário', () => {
    it('deve cadastrar usuário com dados válidos', async () => {
      // simula: nenhum usuário existe
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const mockUser = { id: '1', name: 'Renato', email: 'renato@example.com' };
      jest.spyOn(User, 'create').mockResolvedValue(mockUser);

      const userData = { name: 'Renato', email: 'renato@example.com', password: 'Senha123!' };
      const result = await authService.register(userData);

      expect(result).toEqual(mockUser);
    });

    it('não deve cadastrar com email já existente', async () => {
      // simula: já existe usuário com esse email
      jest.spyOn(User, 'findOne').mockResolvedValue({ id: '1', email: 'renato@example.com' });

      const userData = { name: 'Renato', email: 'renato@example.com', password: 'Senha123!' };

      await expect(authService.register(userData))
        .rejects
        .toThrow('Email já cadastrado');
    });
  });

  describe('Login de usuário', () => {
    it('deve logar com credenciais corretas', async () => {
      const mockUser = { id: '1', email: 'renato@example.com', password: 'Senha123!' };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      // força comparação de senha retornar true
      jest.spyOn(authService, 'comparePassword').mockResolvedValue(true);

      const credentials = { email: 'renato@example.com', password: 'Senha123!' };
      const result = await authService.login(credentials);

      expect(result).toHaveProperty('token');
    });

    it('não deve logar com senha incorreta', async () => {
      const mockUser = { id: '1', email: 'renato@example.com', password: 'Senha123!' };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      jest.spyOn(authService, 'comparePassword').mockResolvedValue(false);

      const credentials = { email: 'renato@example.com', password: 'SenhaErrada' };

      await expect(authService.login(credentials))
        .rejects
        .toThrow('Credenciais inválidas');
    });

    it('não deve logar com email não cadastrado', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const credentials = { email: 'naoexiste@example.com', password: 'Senha123!' };

      await expect(authService.login(credentials))
        .rejects
        .toThrow('Credenciais inválidas');
    });
  });

  // ---------- TESTES ADICIONAIS ----------
  describe('Casos adicionais', () => {
    it('não deve cadastrar usuário sem email', async () => {
      const userData = { name: 'Renato', password: 'Senha123!' };
      await expect(authService.register(userData))
        .rejects
        .toThrow();
    });

    it('não deve cadastrar usuário sem senha', async () => {
      const userData = { name: 'Renato', email: 'renato2@example.com' };
      await expect(authService.register(userData))
        .rejects
        .toThrow();
    });

    it('comparePassword deve retornar true para senhas iguais', async () => {
      const result = await authService.comparePassword('123456', '123456');
      expect(result).toBe(true);
    });

    it('comparePassword deve retornar false para senhas diferentes', async () => {
      const result = await authService.comparePassword('123456', 'abcdef');
      expect(result).toBe(false);
    });

    it('deve retornar token válido (mocked) ao logar corretamente', async () => {
      const mockUser = { id: '1', email: 'renato@example.com', password: 'Senha123!' };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'comparePassword').mockResolvedValue(true);

      const credentials = { email: 'renato@example.com', password: 'Senha123!' };
      const result = await authService.login(credentials);

      expect(result.token).toBe('mocked-jwt-token');
    });
  });
});
