import { Server } from "socket.io";
import { IAuctionNotifier } from "../../../core/ports/services";

export class SocketAuctionNotifier implements IAuctionNotifier {
  constructor(private readonly io: Server) {}

  bidPlaced(lotId: string, payload: unknown): void {
    this.io.to(`lot:${lotId}`).emit("bid:placed", payload);
  }

  lotUpdated(lotId: string, payload: unknown): void {
    this.io.to(`lot:${lotId}`).emit("lot:updated", payload);
    this.io.emit("lots:updated", { lotId });
  }

  walletUpdated(userId: string, payload: { balance: number; committed: number; available: number }): void {
    this.io.to(`user:${userId}`).emit("wallet:updated", payload);
  }
}
