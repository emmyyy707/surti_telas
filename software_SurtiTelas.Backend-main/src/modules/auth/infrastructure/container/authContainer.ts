import { prisma } from '../../../../config/database';
import { BcryptPasswordHasher } from '../services/BcryptPasswordHasher';
import { JwtTokenService } from '../services/JwtTokenService';
import { PrismaAuthRepository } from '../repositories/PrismaAuthRepository';
import { SmtpEmailService } from '../../../shared/infrastructure/services/SmtpEmailService';
import { LoginUser } from '../../application/use-cases/LoginUser';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { RefreshToken } from '../../application/use-cases/RefreshToken';
import { GetProfile, UpdateProfile, Logout } from '../../application/use-cases/ProfileUseCases';
import { ListUsers } from '../../application/use-cases/ListUsers';
import {
  AssignPermissionToRole,
  CreatePermission,
  GetPermissions,
  GetPermissionById,
  UpdatePermission,
  DeletePermission,
  UpdatePermissionStatus,
  GetRolePermissions,
  RemovePermissionFromRole,
  ListRoles,
  GetRole,
  CreateRole,
  UpdateRole,
  DeleteRole,
  UpdateRoleStatus,
} from '../../application/use-cases/ManagePermissions';
import { EnableTwoFactor } from '../../application/use-cases/EnableTwoFactor';
import { VerifyTwoFactor } from '../../application/use-cases/VerifyTwoFactor';
import { DisableTwoFactor } from '../../application/use-cases/DisableTwoFactor';
import { ForgotPassword } from '../../application/use-cases/ForgotPassword';
import { ResetPassword } from '../../application/use-cases/ResetPassword';
import { ChangePassword } from '../../application/use-cases/ChangePassword';
import { GoogleAuth } from '../../application/use-cases/GoogleAuth';
import { UpdateUserStatus, DeleteUser } from '../../application/use-cases/UserManagement';
import { env } from '../../../../config/env';

const authRepository = new PrismaAuthRepository(prisma);
const tokenService = new JwtTokenService();
const passwordHasher = new BcryptPasswordHasher();
const emailService = new SmtpEmailService({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
  fromName: env.SMTP_FROM_NAME,
  fromEmail: env.SMTP_FROM_EMAIL,
});

export const authUseCases = {
  login: new LoginUser(authRepository, tokenService, passwordHasher),
  register: new RegisterUser(authRepository, passwordHasher, tokenService),
  refresh: new RefreshToken(authRepository, tokenService, passwordHasher),
  google: new GoogleAuth(authRepository, passwordHasher, tokenService),
  getProfile: new GetProfile(authRepository),
  updateProfile: new UpdateProfile(authRepository),
  logout: new Logout(authRepository),
  listUsers: new ListUsers(authRepository),
  getPermissions: new GetPermissions(authRepository),
  getPermissionById: new GetPermissionById(authRepository),
  createPermission: new CreatePermission(authRepository),
  updatePermission: new UpdatePermission(authRepository),
  deletePermission: new DeletePermission(authRepository),
  updatePermissionStatus: new UpdatePermissionStatus(authRepository),
  getRolePermissions: new GetRolePermissions(authRepository),
  assignPermissionToRole: new AssignPermissionToRole(authRepository),
  removePermissionFromRole: new RemovePermissionFromRole(authRepository),
  listRoles: new ListRoles(authRepository),
  getRole: new GetRole(authRepository),
  createRole: new CreateRole(authRepository),
  updateRole: new UpdateRole(authRepository),
  deleteRole: new DeleteRole(authRepository),
  updateRoleStatus: new UpdateRoleStatus(authRepository),
  enableTwoFactor: new EnableTwoFactor(authRepository),
  verifyTwoFactor: new VerifyTwoFactor(authRepository, tokenService),
  disableTwoFactor: new DisableTwoFactor(authRepository),
  forgotPassword: new ForgotPassword(authRepository, emailService),
  resetPassword: new ResetPassword(authRepository, passwordHasher),
  changePassword: new ChangePassword(authRepository, passwordHasher),
  updateUserStatus: new UpdateUserStatus(authRepository),
  deleteUser: new DeleteUser(authRepository, prisma),
};

export { tokenService };
