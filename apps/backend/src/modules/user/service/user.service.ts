import { UserRepository } from '../repository/user.repository';
import { CreateUserDto, UpdateUserDto, ListUsersDto } from '../dto/user.dto';
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async createUser(tenantId: string, data: CreateUserDto, currentUserId: string) {
    if (!tenantId) {
      throw new ValidationError('Tenant context is required');
    }

    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('Email is already registered');
    }

    if (data.employeeId) {
      const existingEmpId = await this.userRepository.findByEmployeeId(data.employeeId, tenantId);
      if (existingEmpId) {
        throw new ConflictError('Employee ID is already in use within this tenant');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const createInput: Prisma.UserUncheckedCreateInput = {
      tenantId,
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      employeeId: data.employeeId || null,
      phone: data.phone || null,
      department: data.department || null,
      designation: data.designation || null,
      createdBy: currentUserId,
      joinedAt: new Date(),
    };

    const user = await this.userRepository.create(tenantId, createInput);
    
    logger.info(`User Created: ${user.id} in Tenant ${tenantId}`);
    
    const { passwordHash: _ph, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async getUser(id: string, tenantId: string) {
    const user = await this.userRepository.findById(id, tenantId);
    if (!user) throw new NotFoundError('User not found');
    
    const { passwordHash: _ph, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async listUsers(tenantId: string, query: ListUsersDto) {
    const { page = 1, limit = 10, search, department, status } = query;
    const params: any = { page, limit };
    if (search !== undefined) params.search = search;
    if (department !== undefined) params.department = department;
    if (status !== undefined) params.status = status;

    return this.userRepository.searchAndPaginate(tenantId, params);
  }

  public async updateUser(id: string, tenantId: string, data: UpdateUserDto, currentUserId: string) {
    const user = await this.userRepository.findById(id, tenantId);
    if (!user) throw new NotFoundError('User not found');

    if (data.employeeId && data.employeeId !== user.employeeId) {
      const existingEmpId = await this.userRepository.findByEmployeeId(data.employeeId, tenantId);
      if (existingEmpId) {
        throw new ConflictError('Employee ID is already in use within this tenant');
      }
    }

    const updateData: Prisma.UserUncheckedUpdateInput = {
      updatedBy: currentUserId,
    };
    
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.employeeId !== undefined) updateData.employeeId = data.employeeId;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.profileImage !== undefined) updateData.profileImage = data.profileImage;

    const updated = await this.userRepository.update(id, tenantId, updateData);
    logger.info(`User Updated: ${updated.id} in Tenant ${tenantId}`);
    
    const { passwordHash: _ph, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  public async deactivateUser(id: string, tenantId: string, currentUserId: string) {
    const user = await this.userRepository.findById(id, tenantId);
    if (!user) throw new NotFoundError('User not found');

    const updated = await this.userRepository.update(id, tenantId, {
      isActive: false,
      status: 'SUSPENDED',
      updatedBy: currentUserId,
    });
    
    logger.info(`User Deactivated: ${updated.id} in Tenant ${tenantId}`);
    return updated;
  }

  public async activateUser(id: string, tenantId: string, currentUserId: string) {
    const user = await this.userRepository.findById(id, tenantId);
    if (!user) throw new NotFoundError('User not found');

    const updated = await this.userRepository.update(id, tenantId, {
      isActive: true,
      status: 'ACTIVE',
      updatedBy: currentUserId,
    });
    
    logger.info(`User Activated: ${updated.id} in Tenant ${tenantId}`);
    return updated;
  }

  public async softDeleteUser(id: string, tenantId: string, currentUserId: string) {
    const user = await this.userRepository.findById(id, tenantId);
    if (!user) throw new NotFoundError('User not found');

    await this.userRepository.softDelete(id, tenantId, currentUserId);
    logger.info(`User Deleted (Soft): ${id} in Tenant ${tenantId}`);
  }

  public async restoreUser(id: string, tenantId: string, currentUserId: string) {
    const user = await this.userRepository.findByIdWithDeleted(id, tenantId);
    if (!user) throw new NotFoundError('User not found');
    
    if (!user.deletedAt) {
      throw new ValidationError('User is not deleted');
    }

    if (user.employeeId) {
      const existingEmpId = await this.userRepository.findByEmployeeId(user.employeeId, tenantId);
      if (existingEmpId && existingEmpId.id !== user.id) {
        throw new ConflictError('Cannot restore: Employee ID is currently in use by another active user.');
      }
    }

    const restored = await this.userRepository.restore(id, tenantId, currentUserId);
    logger.info(`User Restored: ${id} in Tenant ${tenantId}`);
    
    const { passwordHash: _ph, ...userWithoutPassword } = restored;
    return userWithoutPassword;
  }
}
