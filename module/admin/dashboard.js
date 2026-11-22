import db from '../../models/index.js';
import BaseModule from '../../class/base.module.js';

const { Booth, RentalApplication, User, Station } = db;

class DashboardModule extends BaseModule {
  async summary() {
    try {
      const [
        totalBoothsActive,
        totalApplications,
        waitingReview,
        approved,
        rejected,
        recentApplications,
      ] = await Promise.all([
        Booth.count({ where: { isActive: true } }),
        RentalApplication.count(),
        RentalApplication.count({ where: { status: 'DIAJUKAN' } }),
        RentalApplication.count({ where: { status: 'DISETUJUI' } }),
        RentalApplication.count({ where: { status: 'DITOLAK' } }),
        RentalApplication.findAll({
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            {
              model: Booth,
              as: 'booth',
              attributes: ['id', 'code', 'name'],
              include: [{ model: Station, as: 'station', attributes: ['id', 'name'] }],
            },
          ],
          order: [['submittedAt', 'DESC']],
          limit: 5,
        }),
      ]);

      return {
        status: true,
        data: {
          total_booths_active: totalBoothsActive,
          total_applications: totalApplications,
          waiting_review: waitingReview,
          approved,
          rejected,
          recent_applications: recentApplications,
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new DashboardModule();