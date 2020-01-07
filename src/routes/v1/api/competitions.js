const express = require('express');
const competitionController = require('../../../controllers/v1/competitions');
const authMiddleware = require('../../../middleware/authentication');
const adminMiddleware = require('../../../middleware/admin');

const router = express.Router();

router.get('/posts', competitionController.getAllCompetitions);
router.get('/:id/posts', competitionController.getOneCompetition);
router.post('/:id/posts', [authMiddleware], competitionController.createPost);
router.get('/:id/posts/toppers', competitionController.PostsToppers);
router.post('/:id/vote', authMiddleware, competitionController.createVote);
router.put('/:id/subscribe', authMiddleware, competitionController.subscribe);
router.put('/:id/status', [authMiddleware, adminMiddleware], competitionController.changeCompetitionStatus);
router.put('/:id/banners', [authMiddleware, adminMiddleware], competitionController.updateBanners);
router.put('/:id/posts', competitionController.updateCompetition);
router.post('/:id/judges', [authMiddleware, adminMiddleware], competitionController.addJudges);
router.delete('/:id/judges', [authMiddleware, adminMiddleware], competitionController.removeJudges);
router.post('/', [authMiddleware, adminMiddleware], competitionController.createCompetition);
router.get('/splash', authMiddleware, competitionController.getSplash);

module.exports = router;
