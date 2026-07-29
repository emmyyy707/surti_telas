export class Favorite {
  readonly id: string;
  readonly userId: string;
  readonly productId: string;
  readonly createdAt: Date;

  constructor(data: { id: string; userId: string; productId: string; createdAt: Date }) {
    this.id = data.id;
    this.userId = data.userId;
    this.productId = data.productId;
    this.createdAt = data.createdAt;
  }
}
