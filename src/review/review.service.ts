import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ReviewSchemaType } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return await this.db.review.findMany({
      include: { product: true },
    });
  }

  async findOne(reviewId: string) {
    return await this.db.review.findUnique({
      where: { id: reviewId },
      include: { product: true },
    });
  }

  async create(userId: string, body: ReviewSchemaType) {
    const review = await this.db.review.create({
      data: {
        user: {
          connect: { id: userId },
        },
        product: {
          connect: { id: body.productId },
        },
        rating: body.rating,
        comment: body.comment,
      },
    });

    const rating = await this.getUpdatedProductRating(body.productId);

    if (review) {
      await this.db.product.update({
        where: { id: body.productId },
        data: {
          rating: rating,
        },
      });
      return review;
    } else {
      new Error('Review not created');
    }

    // return review;
  }

  async update(id: string, body: ReviewSchemaType) {
    const review = await this.db.review.create({
      data: {
        user: {
          connect: { id: body.userId },
        },
        product: {
          connect: { id: body.productId },
        },
        rating: body.rating,
        comment: body.comment,
      },
    });

    const rating = await this.getUpdatedProductRating(body.productId);

    if (review) {
      await this.db.product.update({
        where: { id: body.productId },
        data: {
          rating: rating,
        },
      });
      return review;
    } else {
      new Error('Review not Updated');
    }

    return review;
  }
  async delete(reviewId: string) {
    return await this.db.review.delete({
      where: { id: reviewId },
    });
  }

  // Helper Function
  bayesianRating(
    avgRating: number,
    numVotes: number,
    minimumVote: number,
    averageRatingAll: number,
  ) {
    const R = avgRating; // 3.2 Item's average rating
    const v = numVotes; // 5 Item's number of votes
    const m = minimumVote; // 25 Minimum votes required
    const C = averageRatingAll; //3.2 Average rating across all items

    // if (v < m) return R;
    if (v === 0) return 0;
    const rating = (v / (v + m)) * R + (m / (v + m)) * C;

    return Math.min(Math.max(rating, 1), 5);
  }

  async getUpdatedProductRating(productId: string) {
    const averageRatingAll = await this.db.review.aggregate({
      _avg: { rating: true },
    });

    const totalReview = await this.db.review.aggregate({
      _count: { rating: true },
      where: { productId: productId },
    });

    const itemsAverageRating = await this.db.review.aggregate({
      _avg: { rating: true },
      where: { productId: productId },
    });

    return this.bayesianRating(
      Math.min(Math.max(itemsAverageRating._avg.rating as number, 1), 5),
      Math.min(Math.max(totalReview._count.rating, 1), 5),
      25,
      Math.min(Math.max(averageRatingAll._avg.rating as number, 1), 5),
    );
  }
}
