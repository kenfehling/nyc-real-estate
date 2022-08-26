/* global crossfilter */

const MAIN_DATA_FILE = 'data/pca_sampled.csv';
const FILL_COLOR = '#3995e2';
const N_NEIGHBORHOOD_BARS  = 31;

const BOROUGHS = [
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island'
];

const BOROUGH_COLORS = [
  '#1C6',
  FILL_COLOR,
  '#F49',
  '#94F',
  '#F91'
];