import * as express from 'express';
import { SharedState } from '../SharedState.js';
import { WorldCupData } from '../model/WorldCupData.js';
import { createHome, compare, info2, all, team, worldcupgroups } from './utils.js';

const router = express.Router();

const subRouter = express.Router({ mergeParams: true });
router.use('/international', subRouter);

subRouter.get('/', (req, res) => {
  return res.json(createHome(true));
});

router.get('/', (req, res) => {
  return res.json(createHome(false));
})

subRouter.get('/compare', (req, res) => {
  const first = req.query.first;
  const second = req.query.second;
  return res.json(compare(SharedState.internationalState, first, second, true));
});

router.get('/compare', (req, res) => {
  const first = req.query.first;
  const second = req.query.second;
  return res.json(compare(SharedState.clubState, first, second, false));
});

subRouter.get('/compare/:first/:second', (req, res) => {
  const first = req.params.first;
  const second = req.params.second;
  return res.json(compare(SharedState.internationalState, first, second, true));
});

router.get('/compare/:first/:second', (req, res) => {
  const first = req.params.first;
  const second = req.params.second;
  return res.json(compare(SharedState.clubState, first, second, false));
});

subRouter.get('/info2/:league', (req, res) => {
  const id = req.params.league;
  return res.json(info2(id, true));
});

router.get('/info2/:league', (req, res) => {
  const id = req.params.league;
  return res.json(info2(id, false));
});

subRouter.get('/all', (req, res) => {
  return res.json(all(true));
});

router.get('/all', (req, res) => {
  return res.json(all(false));
})

router.get('/team/:team', (req, res) => {
  const id = req.params.team;
  res.json(team(id));
});

router.get('/worldcupgroups', (req, res) => {
  res.json(worldcupgroups());
});

router.get('/models.json&pw=14567695', (req, res) => {
  return res.json(SharedState.clubState.getState());
});

router.get('/models_international.json&pw=14567695', (req, res) => {
  return res.json(SharedState.internationalState.getState());
});

router.get('/metrics', (req, res) => {

});

export default router;