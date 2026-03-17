import express from 'express';
import { postQuestion, submitBid, getRankedBids, getMatchingMentors, getPriceSuggestion, getMyQuestions, getMarketplaceQuestions, acceptBid } from "../controllers/marketplaceController.js";
import authUser from "../middlewares/authUser.js";
import authTutor from "../middlewares/authTutor.js";

const marketplaceRouter = express.Router();

marketplaceRouter.post('/post-question', authUser, postQuestion);
marketplaceRouter.post('/submit-bid', authTutor, submitBid);
marketplaceRouter.get('/ranked-bids/:questionId', getRankedBids);
marketplaceRouter.post('/matching-mentors', getMatchingMentors);
marketplaceRouter.post('/price-suggestion', getPriceSuggestion);
marketplaceRouter.get('/my-questions', authUser, getMyQuestions);
marketplaceRouter.get('/open-questions', getMarketplaceQuestions);
marketplaceRouter.post('/accept-bid', authUser, acceptBid);

export default marketplaceRouter;
