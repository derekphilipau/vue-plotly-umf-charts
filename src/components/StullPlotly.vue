<template>
</template>
<script>
  import Plotly from 'plotly.js/dist/plotly'

  import Analysis from 'ceramicscalc-js/src/analysis/Analysis'
  import GlazyConstants from 'ceramicscalc-js/src/helpers/GlazyConstants'

  export default {
    name: 'stull-plotly',
    props: {
      recipeData: {
        type: Array,
        default: null
      },
      extraRegions: {
        type: Array,
        default: null
      },
      search: {
        type: String,
        default: null
      },
      glazeType: {
        type: Number,
        default: null
      },
      cone: {
        type: String,
        default: null
      },
      xoxide: {
        type: String,
        default: Analysis.OXIDE_NAME.Fe2O3
      },
      yoxide: {
        type: String,
        default: Analysis.OXIDE_NAME.SiO2
      },
      zoxide: {
        type: String,
        default: Analysis.OXIDE_NAME.Al2O3
      },
      height: {
        type: Number,
        default: 500

      },
      width: {
        type: Number,
        default: 900
      },
      margin: {
        type: Object,
        default: () => ({
          left: 30,
          right: 10,
          top: 10,
          bottom: 20
        })
      },
      colortype: {
        type: String,
        default: 'r2o'
      },
      showLabels: {
        type: Boolean,
        default: true
      },
      showAxesLabels: {
        type: Boolean,
        default: true
      },
      showRecipes: {
        type: Boolean,
        default: true
      },
      showStullChart: {
        type: Boolean,
        default: true
      },
      showStullHeatmap: {
        type: Boolean,
        default: true
      },
      showCones: {
        type: Boolean,
        default: true
      },
      showZoomButtons: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        minWidth: 300,
        minHeight: 200,
        constants: new GlazyConstants(),
        minSearchTextLength: 3
      }
    },
    mounted () {
      this.plotlyChart()
    },
    watch: {
      recipeData: function (newValue) {
        this.reset()
      },
      extraRegions: function (newValue) {
        this.reset()
      },
      xoxide: function (newValue) {
        this.reset()
      },
      yoxide: function (newValue) {
        this.reset()
      },
      zoxide: function (newValue) {
        this.reset()
      },
      showCones: function (newValue) {
        this.reset()
      },
      showRecipes: function (newValue) {
        this.reset()
      },
      showStullHeatmap: function (newValue) {
        this.reset()
      },
      showStullChart: function (newValue) {
        this.reset()
      },
      width: function (newValue) {
      },
      height: function (newValue) {
      }
    },
    computed: {
      hasdata: function () {
        if (this.filtereddata && this.filtereddata.length > 0) {
          return true
        }
        return false
      },
      displaywidth: function () {
        if (this.minWidth > this.width) {
          return this.minWidth - this.margin.left - this.margin.right
        }
        return this.width - this.margin.left - this.margin.right
      },
      displayheight: function () {
        if (this.minHeight > this.height) {
          return this.minHeight - this.margin.top - this.margin.bottom
        }
        return this.height - this.margin.top - this.margin.bottom
      },
      filtereddata: function () {
        // If we directly use this.recipeData var, Vue gets BUSY..
        var mydata = this.recipeData

        if (!mydata || mydata.length <= 0) {
          return null
        }

        var mylen = mydata.length
        var filtereddata = {
          type: 'scatter3d',
          mode: 'markers',
          marker: {
            size: 4,
            opacity: 0.5
          },
          x: [],
          y: [],
          z: [],
          text: []
        }

        var searchString = null
        if (this.search && this.search.length >= this.minSearchTextLength) {
          searchString = this.search.toLowerCase()
        }

        for (var i = 0; i < mylen; i++) {
          var xVal = parseFloat(mydata[i].analysis.umfAnalysis[this.xoxide])
          var yVal = parseFloat(mydata[i].analysis.umfAnalysis[this.yoxide])
          var zVal = parseFloat(mydata[i].analysis.umfAnalysis[this.zoxide])
          if (isNaN(zVal)) {
            // Just set z value to 0 if none
            zVal = 0.0
          }

          // Check data for any recipes lacking information
          if (!isNaN(xVal) && !isNaN(yVal)) {
            if (searchString) {
              if ((!mydata[i].name || mydata[i].name === undefined) ||
                mydata[i].name.toLowerCase().indexOf(searchString) === -1) {
                continue
              }
            }

            var currentLength = filtereddata.x.length
            filtereddata.x[currentLength] = xVal
            filtereddata.y[currentLength] = yVal
            filtereddata.z[currentLength] = zVal
            filtereddata.text[currentLength] = mydata[i].name
          }
        }

        return filtereddata
      }
    },
    methods: {
      plotlyChart: function () {
        var data = [this.filtereddata]
        var layout = {
          scene: {
            xaxis: {title: this.xoxide},
            yaxis: {title: this.yoxide},
            zaxis: {title: this.zoxide},
            aspectratio: {
              x: 0.5, y: 3, z: 0.8
            },
            camera: {
              center: {
                x: 0, y: 0, z: 0},
              eye: {
                x: 2.5, y: 0.4, z: 0.4},
              up: {
                x: 0, y: 0, z: 1}
            }
          },
          margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
          }
        }

        Plotly.newPlot('stull-chart-d3', data, layout)
      },
      reset: function () {
        this.plotlyChart()
      },
      clickedrecipe: function (d) {
        if (d.id) {
          var url = 'https://glazy.org/recipes/' + d.id
          window.open(url, '_blank')
        }
      },
      getR2OFillColor: function (r2oTotal) {
        if (isNaN(r2oTotal)) {
          return ''
        }
        return Math.round((this.round(Number(r2oTotal) * 2, 1) / 2) * 100)
      },
      getConeString: function (fromOrtonConeId, toOrtonConeId, isHtml = false) {
        var ortonCone = ''
        // var deltaString = '\u0394';
        var deltaString = '' // Don't show delta in chart
        if (isHtml) {
          deltaString = '&Delta;'
        }
        if (fromOrtonConeId) {
          if (toOrtonConeId && fromOrtonConeId !== toOrtonConeId) {
            ortonCone = deltaString + this.constants.ORTON_CONES_DISPLAY[fromOrtonConeId] +
            '-' + this.constants.ORTON_CONES_DISPLAY[toOrtonConeId]
          } else {
            ortonCone = deltaString + this.constants.ORTON_CONES_DISPLAY[fromOrtonConeId]
          }
        } else if (toOrtonConeId) {
          ortonCone = deltaString + this.constants.ORTON_CONES_DISPLAY[toOrtonConeId]
        }
        return ortonCone
      },
      getAverageCone: function (fromOrtonConeId, toOrtonConeId, isHtml = false) {
        if (fromOrtonConeId) {
          if (toOrtonConeId && fromOrtonConeId !== toOrtonConeId) {
            return this.constants.ORTON_CONES_CSS[Math.round((fromOrtonConeId + toOrtonConeId) / 2)]
          } else {
            return this.constants.ORTON_CONES_CSS[fromOrtonConeId]
          }
        }
        if (toOrtonConeId) {
          return this.constants.ORTON_CONES_CSS[toOrtonConeId]
        }
        return ''
      },
      round: function (value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
      }
    }
  }
</script>

<style>

    .zoom-buttons {
        position: absolute;
        right: 30px;
        top: 30px;
    }

    .axis path,
    .axis line {
        fill: none;
        stroke: rgba(0, 0, 0, 0.1);
        shape-rendering: crispEdges;
    }

    .bar {
        fill: orange;
    }

    .bar:hover {
        fill: orangered ;
    }

    .x.axis path {
        display: none;
    }

    .d3-tip {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        font-size: .875rem;
        line-height: 1.125rem;
        font-weight: normal;
        padding: .75rem;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        border-radius: 2px;
    }

    /* Creates a small triangle extender for the tooltip */
    .d3-tip:after {
        box-sizing: border-box;
        display: inline;
        font-size: 10px;
        width: 100%;
        line-height: 1;
        color: rgba(0, 0, 0, 0.8);
        content: "\25BC";
        position: absolute;
        text-align: center;
    }

    /* Style northward tooltips differently */
    .d3-tip.n:after {
        margin: -1px 0 0 0;
        top: 100%;
        left: 0;
    }

    .axis-names {
        font-size: 1.25rem;
        font-weight: 200;
        color: rgba(0, 0, 0, 0.8);
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .axis-names::selection {
        background: none;
    }

    .stull-region-unfused {
        fill: #66ff66;
    }
    .stull-region-matte {
        fill: #99ff99;
    }
    .stull-region-semimatte {
        fill: #ccffcc;
    }
    .stull-region-underfired {
        fill: #66ff66;
    }
    .stull-region-crazed {
        fill: #dddddd;
    }

    .stull-region-names {
        font-weight: 200;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .stull-region-names::selection {
        background: none;
    }

    .stull-temp-names {
        font-size: .75rem;
        font-weight: 200;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .stull-temp-names::selection {
        background: none;
    }

    .orton-cone {
        font-size: .75rem;
        font-weight: 200;
    }

    .r2ocolor    { fill: rgba(200, 200, 200, 1); }
    .r2ocolor100 { fill: rgba(195, 150, 150, 1); }
    .r2ocolor95  { fill: rgba(210, 150, 150, 1); }
    .r2ocolor90  { fill: rgba(225, 150, 150, 1); }
    .r2ocolor85  { fill: rgba(240, 150, 150, 1); }
    .r2ocolor80  { fill: rgba(255, 150, 150, 1); }
    .r2ocolor75  { fill: rgba(255, 165, 150, 1); }
    .r2ocolor70  { fill: rgba(255, 180, 150, 1); }
    .r2ocolor65  { fill: rgba(255, 195, 150, 1); }
    .r2ocolor60  { fill: rgba(255, 210, 150, 1); }
    .r2ocolor55  { fill: rgba(255, 225, 150, 1); }
    .r2ocolor50  { fill: rgba(255, 240, 150, 1); }
    .r2ocolor45  { fill: rgba(255, 255, 165, 1); }
    .r2ocolor40  { fill: rgba(255, 255, 195, 1); }
    .r2ocolor35  { fill: rgba(255, 255, 225, 1); }
    .r2ocolor30  { fill: rgba(255, 255, 255, 1); }
    .r2ocolor25  { fill: rgba(240, 240, 255, 1); }
    .r2ocolor20  { fill: rgba(225, 225, 255, 1); }
    .r2ocolor15  { fill: rgba(210, 210, 255, 1); }
    .r2ocolor10  { fill: rgba(195, 195, 255, 1); }
    .r2ocolor5   { fill: rgba(180, 180, 255, 1); }
    .r2ocolor0   { fill: rgba(165, 165, 255, 1); }

    .glazetype460 {  fill: #ffffff;  }
    .glazetype470 {  fill: #ffffff;  }
    .glazetype480 {  fill: #fefef0;  }
    .glazetype490 {  fill: #b22222;  }
    .glazetype500 {  fill: #ace1af;  }
    .glazetype510 {  fill: #c4d1e1;  }
    .glazetype520 {  fill: #4b945e;  }
    .glazetype530 {  fill: #ffdb58;  }
    .glazetype533 {  fill: #91a2a3;  }
    .glazetype535 {  fill: #ffbf00;  }
    .glazetype540 {  fill: #654321;  }
    .glazetype550 {  fill: #6c6517;  }
    .glazetype560 {  fill: #63382f;  }
    .glazetype570 {  fill: #9b391c;  }
    .glazetype580 {  fill: #3d3b32;  }
    .glazetype585 {  fill: #8e2222;  }
    .glazetype590 {  fill: #efeee7;  }
    .glazetype600 {  fill: #e0d7c5;  }
    .glazetype610 {  fill: #de815b;  }
    .glazetype620 {  fill: #f4e8d0;  }
    .glazetype630 {  fill: #f7f3eb;  }
    .glazetype635 {  fill: #ee0000;  }
    .glazetype640 {  fill: #a52927;  }
    .glazetype650 {  fill: #9d1624;  }
    .glazetype660 {  fill: #ca211f;  }
    .glazetype670 {  fill: #c7a09a;  }
    .glazetype673 {  fill: #ffc0cb;  }
    .glazetype675 {  fill: #ff1515;  }
    .glazetype680 {  fill: #00cc00;  }
    .glazetype690 {  fill: #2c7649;  }
    .glazetype700 {  fill: #457640;  }
    .glazetype710 {  fill: #437f3f;  }
    .glazetype720 {  fill: #529777;  }
    .glazetype730 {  fill: #749686;  }
    .glazetype740 {  fill: #00ff00;  }
    .glazetype745 {  fill: #40e0d0;  }
    .glazetype750 {  fill: #0000ff;  }
    .glazetype760 {  fill: #0047ab;  }
    .glazetype770 {  fill: #6c94b6;  }
    .glazetype780 {  fill: #29499c;  }
    .glazetype790 {  fill: #33a8b9;  }
    .glazetype800 {  fill: #436a92;  }
    .glazetype810 {  fill: #0000cc;  }
    .glazetype820 {  fill: #800080;  }
    .glazetype830 {  fill: #a41ca4;  }
    .glazetype840 {  fill: #8a0a95;  }
    .glazetype850 {  fill: #5d015d;  }
    .glazetype860 {  fill: #eeeeee;  }
    .glazetype870 {  fill: #efefef;  }
    .glazetype880 {  fill: #000000;  }
    .glazetype890 {  fill: #2a1c0e;  }
    .glazetype900 {  fill: #222222;  }
    .glazetype910 {  fill: #111111;  }
    .glazetype920 {  fill: #ffff00;  }
    .glazetype930 {  fill: #ffe484;  }
    .glazetype940 {  fill: #e8d04c;  }
    .glazetype950 {  fill: #f5ee25;  }
    .glazetype960 {  fill: #ffff00;  }
    .glazetype970 {  fill: #fff700;  }
    .glazetype980 {  fill: #ffffff;  }
    .glazetype990 {  fill: #ffffff;  }
    .glazetype1000 {  fill: #ffffff;  }
    .glazetype1010 {  fill: #ffffff;  }
    .glazetype1020 {  fill: #ffffff;  }
    .glazetype1030 {  fill: #ffffff;  }
    .glazetype1040 {  fill: #ffffff;  }
    .glazetype1050 {  fill: #ffffff;  }
    .glazetype1055 {  fill: #ffffff;  }
    .glazetype1060 {  fill: #ffffff;  }
    .glazetype1070 {  fill: #ffffff;  }
    .glazetype1080 {  fill: #ffffff;  }
    .glazetype1090 {  fill: #ffffff;  }
    .glazetype1100 {  fill: #ffffff;  }
    .glazetype1130 {  fill: #ffffff;  }
    .glazetype1140 {  fill: #ffffff;  }
    .glazetype1150 {  fill: #ffffff;  }
    .glazetype1160 {  fill: #ffffff;  }
    .glazetype1170 {  fill: #ffffff;  }

    .orton {  fill: #999999; }
    .orton022 {  fill: #cc0000; }
    .orton021 {  fill: #d30000; }
    .orton020 {  fill: #d60000; }
    .orton019 {  fill: #d90000; }
    .orton018 {  fill: #dd0000; }
    .orton017 {  fill: #e30000; }
    .orton016 {  fill: #e60000; }
    .orton015 {  fill: #e90000; }
    .orton014 {  fill: #ee0000; }
    .orton013 {  fill: #f60000; }
    .orton012 {  fill: #ff0000; }
    .orton011 {  fill: #ff2200; }
    .orton010 {  fill: #ff4400; }
    .orton09 {  fill: #ff5500; }
    .orton08 {  fill: #ff6600; }
    .orton07 {  fill: #ff7700; }
    .orton06 {  fill: #ff8800; }
    .orton05-1-2 {  fill: #ff9900; }
    .orton05 {  fill: #ffaa00; }
    .orton04 {  fill: #ffbb00; }
    .orton03 {  fill: #ffcc00; }
    .orton02 {  fill: #ffdd00; }
    .orton01 {  fill: #ffee00; }
    .orton1 {  fill: #ffff00; }
    .orton2 {  fill: #ffff22; }
    .orton3 {  fill: #ffff44; }
    .orton4 {  fill: #ffff66; }
    .orton5 {  fill: #ffff88; }
    .orton5-1-2 {  fill: #ffffaa; }
    .orton6 {  fill: #ffffbb; }
    .orton7 {  fill: #ffffcc; }
    .orton8 {  fill: #ffffdd; }
    .orton9 {  fill: #ffffee; }
    .orton10 {  fill: #ffffff; }
    .orton11 {  fill: #ffffff; }
    .orton12 {  fill: #ffffff; }
    .orton13 {  fill: #ffffff; }
    .orton14 {  fill: #ffffff; }

</style>