/* global $, d3, dc, crossfilter, mori */

const margin = {top: 20, right: 20, bottom: 30, left: 80};

const prepareData = (data) => {
  return data.map(d => mori.toJs(
    mori.zipmap(
      columns.map(c => c.name),
      columns.map(c => c.type.cast(d, c.name)))));
};

const getSize = (selector, useMargin=true) => {
  // const $plot = $(selector);
  // const width = $plot.width() - (useMargin ? 0 : margin.left - margin.right);
  // const height = $plot.height() - (useMargin ? 0 : margin.top - margin.bottom);
  // return {width, height};
  return {width: 400, height: 300};
};

const createPcaPlot = (ndx) => {
  const {width, height} = getSize('#pca');
  makeScatterPlot(
    '#pca', ndx, width, height, 'pca_x', 'pca_y',
    '', '', 6,'.2s', '.2s',
    boroughColorReduceFn,
    BOROUGH_COLOR_SCALE,
    null, null, true);
};

const createMapPlot = (ndx) => {
  const {width, height} = getSize('#map');
  makeScatterPlot(
    '#map', ndx, width, height,
    'lng', 'lat', 'Longitude', 'Latitude', 4.5,
    '.3s', '.3s',
    boroughColorReduceFn,
    BOROUGH_COLOR_SCALE,
    4, 4);
};

const createPriceToSqFtPlot = (ndx) => {
  const {width, height} = getSize('#price_sq_ft');
  makeScatterPlot(
    '#price_sq_ft', ndx, width, height,
    'GROSS SQUARE FEET', 'SALE PRICE',
    'Sale price', 'Square Footage', 6,
    '.2s', '.2s',
    boroughColorReduceFn,
    BOROUGH_COLOR_SCALE,
    6, 6, true);
};

const createBoroughPlot = (ndx) => {
  const {width, height} = getSize('#borough', false);
  const boroughDim  = ndx.dimension(d => d.BOROUGH);
  const count = boroughDim.group().reduceCount();
  const chart = dc.rowChart("#borough")
    .width(width - 12)
    .height(height - 14)
    .dimension(boroughDim)
    .group(count)
    .elasticX(true)
    .colorAccessor(d => boroughToIndexMap[d.key])
    .colors(BOROUGH_COLOR_SCALE);

  chart.xAxis().ticks(3);
};

const createNeighborhoodPlot = (ndx) => {
  const {width, height} = getSize('#neighborhood', false);
  const neighborhoodDim  = ndx.dimension(d => d.NEIGHBORHOOD);
  // const group = neighborhoodDim.group().reduceCount();
  const group = neighborhoodDim.group().reduce(
    function (p, v) {
      p.count = p.count ? p.count + 1 : 1;
      p.colorKey = boroughToIndexMap[v.BOROUGH];
      return p;
    },
    function (p, v) {
      p.count -= 1;
      return p;
    },
    function () { return {}; }
  )
  const totalHeight = height * 2 + 37;
  const nBars = 31;
  const chart = dc.rowChart('#neighborhood')
    .width(width - 60)
    .height(totalHeight)
    .dimension(neighborhoodDim)
    .group(group)
    .elasticX(true)
    .colorAccessor(d => {
      return d.value.colorKey;
    })
    .colors(BOROUGH_COLOR_SCALE)
    .ordering(d => 0 - d.value.count)
    .valueAccessor(d => {
      return d.value.count;
    })
    .fixedBarHeight(totalHeight / nBars * 0.67)
    .cap(nBars)
    .othersGrouper((top, others) => {
      return top.filter(item => item.value.count > 0)
    });
  chart.xAxis().ticks(2);
};

const createPlots = (data) => {
  const ndx = crossfilter(data);
  createPcaPlot(ndx);
  createMapPlot(ndx);
  createPriceToSqFtPlot(ndx);
  createBoroughPlot(ndx);
  createNeighborhoodPlot(ndx);
  dc.renderAll();
};

$(() => {
  d3.csv(MAIN_DATA_FILE).then(prepareData).then(createPlots);

  // Reset all filters
  $('.reset').click((event) => {
    event.preventDefault();
    dc.filterAll();
    dc.renderAll();
  })
});