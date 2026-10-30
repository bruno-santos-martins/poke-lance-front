import { prisma } from "./client";
import { IUserRepository } from "../../../../core/ports/repositories";
import { User } from "../../../../core/domain/entities";

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
  }
}
