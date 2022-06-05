/* global $, d3, dc, crossfilter, mori */

const colTypes = {
  NUMERIC: {
    cast: (d, c) => +d[c]
  },
  INVERSE_NUMERIC: {
    cast: (d, c) => 0 - +d[c]
  },
  CATEGORICAL: {
    cast: (d, c) => d[c]
  }
};

const columns = [
  // {name: 'YEAR BUILT', type: colTypes.NUMERIC},
  // {name: 'BUILDING CLASS AT PRESENT', type: colTypes.CATEGORICAL},
  // {name: 'BUILDING CLASS AT TIME OF SALE', type: colTypes.CATEGORICAL},
  {name: 'NEIGHBORHOOD', type: colTypes.CATEGORICAL},
  {name: 'BOROUGH', type: colTypes.CATEGORICAL},
  {name: 'SALE PRICE', type: colTypes.NUMERIC},
  {name: 'GROSS SQUARE FEET', type: colTypes.NUMERIC},
  {name: 'LAND SQUARE FEET', type: colTypes.NUMERIC},
  // {name: 'RESIDENTIAL UNITS', type: colTypes.NUMERIC},
  // {name: 'COMMERCIAL UNITS', type: colTypes.NUMERIC},
  // {name: 'TOTAL UNITS', type: colTypes.NUMERIC},
  // {name: 'mds_x', type: colTypes.NUMERIC},
  // {name: 'mds_y', type: colTypes.NUMERIC},
  {name: 'pca_x', type: colTypes.NUMERIC},
  {name: 'pca_y', type: colTypes.NUMERIC},
  {name: 'lat', type: colTypes.NUMERIC},
  {name: 'lng', type: colTypes.NUMERIC},
  {name: 'neighborhood_lat', type: colTypes.NUMERIC},
  {name: 'neighborhood_lng', type: colTypes.NUMERIC},
  // {name: 'cluster', type: colTypes.NUMERIC},
];

const getColumn = (name) => columns.find((c) => c.name === name);

const getDomain = (data, c) => {
  return [d3.min(data, (d) => d[c]), d3.max(data, (d) => d[c])];
};

const rotateAxisLabels = (axis) => {
  axis.selectAll("text")
    .attr("y", -2)
    .attr("x", 9)
    .attr("transform", "rotate(75)")
    .style("text-anchor", "start");
};

const getCategoricalNames = (data, c) =>
  mori.toJs(mori.sortedSet(...data.map(d => d[c])));

const sortCategorical = (origData, c) => {
  return origData.sort(function(x, y){
    return d3.ascending(x[c], y[c]);
  });
};

const createNameToIndexMap = (origData, c) => {
  const data = sortCategorical(origData, c);
  const names = getCategoricalNames(data, c)
  const n = names.length;
  return mori.toJs(mori.zipmap(names, mori.range(n)));
};

const defaultGroupFn = x => x;

const makeScatterPlot = (container_selector, ndx, width, height,
                         col1, col2, xAxis='', yAxis='', radius=3.5,
                         xTickFormat='.3s', yTickFormat='.3s', groupFn=null,
                         colors=FILL_COLOR, xTicks=null, yTicks=null,
                         axisPadding=false) => {
  const chart = dc.scatterPlot(container_selector);
  const dim = ndx.dimension(function (d) {
    return [d[col1], d[col2]];
  });
  const group = groupFn ? groupFn(dim.group()) : dim.group();
  chart.width(width)
    .height(height)
    .x(d3.scaleLinear().domain(getDomain(ndx.all(), col1)))
    .y(d3.scaleLinear().domain(getDomain(ndx.all(), col2)))
    .yAxisLabel(xAxis)
    .xAxisLabel(yAxis)
    .dimension(dim)
    .symbolSize(radius)
    .excludedOpacity(0.5)
    .group(group)
    .colors(colors)
    .colorAccessor(d => d.value.colorKey);

  if(groupFn) {
    chart.existenceAccessor(d => d.value.count);
  }

  chart.xAxis().tickFormat(d3.format(xTickFormat));
  chart.yAxis().tickFormat(d3.format(yTickFormat));

  if (xTicks) {
    chart.xAxis().ticks(xTicks);
  }
  if (yTicks) {
    chart.yAxis().ticks(yTicks);
  }

  if (axisPadding) {
      chart
      .elasticY(true)
      .yAxisPadding('1%')
      .elasticX(true)
      .xAxisPadding('1%')
  }
};

const boroughToIndexMap = mori.toJs(mori.zipmap(
  BOROUGHS,
  mori.range(BOROUGHS.length)));

const BOROUGH_COLOR_SCALE =
  d3.scaleOrdinal().domain([0, 1, 2, 3, 4]).range(BOROUGH_COLORS);

const boroughColorReduceFn = g => g.reduce(
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
);