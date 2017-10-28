<template>
</template>
<script>
  import Plotly from 'plotly.js/dist/plotly'

  import Analysis from 'ceramicscalc-js/src/analysis/Analysis'
  import GlazyConstants from 'ceramicscalc-js/src/helpers/GlazyConstants'

  export default {
    name: 'umf-plotly',
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
      oxide3: {
        type: String,
        default: Analysis.OXIDE_NAME.Fe2O3
      },
      oxide2: {
        type: String,
        default: Analysis.OXIDE_NAME.SiO2
      },
      oxide1: {
        type: String,
        default: Analysis.OXIDE_NAME.Al2O3
      },
      noZeros: {
        type: Boolean,
        default: false
      },
      isThreeAxes: {
        type: Boolean,
        default: false
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
      showCones: {
        type: Boolean,
        default: true
      },
      showZoomButtons: {
        type: Boolean,
        default: false
      },
      chartHeight: {
        type: Number,
        default: 200
      }
    },
    data () {
      return {
        myPlot: null,
        constants: new GlazyConstants(),
        minSearchTextLength: 3,
        defaultPlotlyConfiguration: {
          modeBarButtonsToRemove: [
            'sendDataToCloud',
            'lasso2d',
            'toggleSpikelines',
            'hoverClosestCartesian',
            'hoverCompareCartesian',
            'hoverClosest3d',
            'resetCameraLastSave3d'
          ],
          displaylogo: false,
          showTips: true
        }
      }
    },
    mounted () {
      this.myPlot = document.getElementById('stull-chart-d3')

      if (this.isThreeAxes) {
        this.plotly3DChart(true)
      } else {
        this.plotly2DChart(true)
      }
    },
    watch: {
      recipeData: function (newValue) {
        this.reset(true)
      },
      extraRegions: function (newValue) {
        this.reset()
      },
      oxide3: function (newValue) {
        this.reset(true)
      },
      oxide2: function (newValue) {
        this.reset(true)
      },
      oxide1: function (newValue) {
        this.reset(true)
      },
      glazeType: function (newValue) {
        this.reset(true)
      },
      search: function (newValue) {
        this.reset(true)
      },
      noZeros: function (newValue) {
        this.reset(true)
      },
      isThreeAxes: function (newValue) {
        this.reset(true)
      },
      showStullChart: function (newValue) {
        this.reset(true)
      }
    },
    computed: {
      hasdata: function () {
        if (this.filtereddata && this.filtereddata.length > 0) {
          return true
        }
        return false
      },
      filtereddata: function () {
        // If we directly use this.recipeData var, Vue gets BUSY..
        var mydata = this.recipeData

        if (!mydata || mydata.length <= 0) {
          return null
        }

        var mylen = mydata.length
        var filtereddata = {}
        var matrix = [] // Keep track of collisions

        if (this.isThreeAxes) {
          filtereddata = {
            type: 'scatter3d',
            mode: 'markers',
            marker: {
              color: [],
              size: 4,
              opacity: 0.5
            },
            hoverinfo: 'text',
            x: [],
            y: [],
            z: [],
            name: [],
            text: [],
            customdata: []
          }
        } else {
          filtereddata = {
            type: 'scatter',
            mode: 'markers',
            marker: {
              color: [],
              size: 8,
              opacity: 0.5
            },
            hoverinfo: 'text',
            x: [],
            y: [],
            z: [],
            name: [],
            text: [],
            customdata: []
          }
        }

        var glazeTypeBranch = []
        if (this.glazeType) {
          if (this.constants.GLAZE_TYPE_TREE[this.glazeType] !== 'undefined') {
            glazeTypeBranch = this.constants.GLAZE_TYPE_TREE[this.glazeType]
          }
        }

        var searchString = null
        if (this.search && this.search.length >= this.minSearchTextLength) {
          searchString = this.search.toLowerCase()
        }

        for (var i = 0; i < mylen; i++) {
          if (glazeTypeBranch.length > 0) {
            if (glazeTypeBranch.indexOf(mydata[i].mti) < 0) {
              continue
            }
          }
          if (searchString) {
            if ((!mydata[i].name || mydata[i].name === undefined) ||
              mydata[i].name.toLowerCase().indexOf(searchString) === -1) {
              continue
            }
          }

          var xVal = 0.0
          var yVal = 0.0
          var zVal = 0.0
          if (this.isThreeAxes) {
            xVal = parseFloat(mydata[i].analysis.umfAnalysis[this.oxide3])
            zVal = parseFloat(mydata[i].analysis.umfAnalysis[this.oxide1])
            yVal = parseFloat(mydata[i].analysis.umfAnalysis[this.oxide2])

            if (isNaN(xVal)) { xVal = 0.0 }
            if (isNaN(zVal)) { zVal = 0.0 }
            if (isNaN(yVal)) { yVal = 0.0 }

            if (this.noZeros && (xVal <= 0 || yVal <= 0 || zVal <= 0)) {
              continue
            }
          } else {
            xVal = parseFloat(mydata[i].analysis.umfAnalysis[this.oxide2])
            yVal = parseFloat(mydata[i].analysis.umfAnalysis[this.oxide1])

            if (isNaN(xVal) || isNaN(yVal)) {
              continue
            }
            // Adjust coordinates using stacked collision
            var point = xVal.toFixed(2) + ':' + yVal.toFixed(2)
            if (point in matrix) {
              xVal += matrix[point] / 2
              yVal += matrix[point]
              matrix[point] += 0.001
            } else {
              matrix[point] = 0
            }
          }

          var currentLength = filtereddata.x.length
          filtereddata.x[currentLength] = xVal
          filtereddata.y[currentLength] = yVal
          filtereddata.z[currentLength] = zVal

          var rt = ''
          var cones = this.getConeString(mydata[i].foci, mydata[i].toci, false)
          if (cones) {
            rt += cones + ' '
          }
          rt += mydata[i].name
          if (mydata[i].mti &&
            mydata[i].mti in this.constants.GLAZE_TYPES) {
            rt += '<br><span style="color:#cccccc">' +
              this.constants.GLAZE_TYPES[mydata[i].mti] +
              '</span>'
          }
          rt += '<br>'
          if (this.isThreeAxis) {
            rt += Number(xVal).toFixed(2) +
              ' ' + Analysis.OXIDE_NAME_DISPLAY[this.oxide3] + ' ' +
              Number(zVal).toFixed(2) + ' ' +
              Analysis.OXIDE_NAME_DISPLAY[this.oxide1] + ' ' +
              Number(yVal).toFixed(2) + ' ' +
              Analysis.OXIDE_NAME_DISPLAY[this.oxide2]
          } else {
            rt += Number(xVal).toFixed(2) +
              ' ' + Analysis.OXIDE_NAME_DISPLAY[this.oxide2] + ' ' +
              Number(yVal).toFixed(2) + ' ' +
              Analysis.OXIDE_NAME_DISPLAY[this.oxide1]
          }
          rt += '<br><span style="color:yellow">' +
            Number(mydata[i].analysis.umfAnalysis.SiO2Al2O3Ratio).toFixed(2) +
            '</span> SiO<sub>2</sub>:Al<sub>2</sub>O<sub>3</sub>' +
            '<br><span style="color:yellow">' +
            Number(mydata[i].analysis.umfAnalysis.R2OTotal).toFixed(2) + ':' +
            Number(mydata[i].analysis.umfAnalysis.ROTotal).toFixed(2) +
            '</span> R<sub>2</sub>O:RO'

          filtereddata.text[currentLength] = rt
          filtereddata.customdata[currentLength] = mydata[i].id
          filtereddata.marker.color[currentLength] =
            this.getR2OFillColor(mydata[i].analysis.umfAnalysis.R2OTotal)
        }

        console.log('Number of Recipes: ' + filtereddata.x.length)

        return filtereddata
      }
    },
    methods: {
      plotly3DChart: function (isNew = false) {
        var data = [this.filtereddata]
        if (isNew) {
          Plotly.newPlot('stull-chart-d3', data, this.get3DLayout(), this.defaultPlotlyConfiguration)

          this.myPlot.on('plotly_click', function (data) {
            if (data.points && data.points[0].customdata) {
              this.$emit('clickedUmfPlotly', data.points[0])
            }
          }.bind(this))
        } else {
          Plotly.update('stull-chart-d3', data, this.get3DLayout())
        }
      },
      plotly2DChart: function (isNew = false) {
        var data = [this.filtereddata]
        if (isNew) {
          Plotly.newPlot('stull-chart-d3', data, this.get2DLayout(), this.defaultPlotlyConfiguration)
          this.myPlot.on('plotly_click', function (data) {
            if (data.points && data.points[0].customdata) {
              this.$emit('clickedUmfPlotly', data.points[0])
            }
          }.bind(this))
        } else {
          Plotly.update('stull-chart-d3', data, this.get2DLayout())
        }
      },
      get3DLayout: function () {
        var layout = {
          scene: {
            xaxis: {title: this.oxide3},
            yaxis: {title: this.oxide2},
            zaxis: {title: this.oxide1},
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
          },
          height: this.chartHeight
        }
        return layout
      },
      get2DLayout: function () {
        var layout = {
          hovermode: 'closest',
          title: 'Data Labels Hover',
          margin: {
            l: 26,
            r: 0,
            b: 26,
            t: 0
          },
          height: this.chartHeight,
          xaxis: {
            title: Analysis.OXIDE_NAME_UNICODE[this.oxide2],
            titlefont: {
              family: 'Arial, sans-serif',
              size: 18,
              color: '#999999'
            },
            showticklabels: true,
            tickangle: 45,
            tickfont: {
              family: 'Arial, sans-serif',
              size: 12,
              color: '#999999'
            },
            autotick: true,
            ticks: 'inside',
            tick0: 0,
            ticklen: 0,
            tickwidth: 0
          },
          yaxis: {
            title: Analysis.OXIDE_NAME_UNICODE[this.oxide1],
            titlefont: {
              family: 'Arial, sans-serif',
              size: 18,
              color: '#999999'
            },
            showticklabels: true,
            tickangle: 45,
            tickfont: {
              family: 'Arial, sans-serif',
              size: 12,
              color: '#999999'
            },
            autotick: true,
            ticks: 'inside',
            tick0: 0,
            ticklen: 0,
            tickwidth: 0
          }
        }

        var isSiAlAxes = true
        if (this.oxide2 !== Analysis.OXIDE_NAME.SiO2 ||
          this.oxide1 !== Analysis.OXIDE_NAME.Al2O3) {
          // Do not show Si:Al map overlays
          isSiAlAxes = false
        }

        if (this.showStullChart && isSiAlAxes) {
          layout.shapes = [
            // Stull Unfused
            {
              type: 'path',
              layer: 'below',
              path: ' M 0.5,0.39 L2.8,1.0 L0.5,1.0 Z',
              fillcolor: 'rgba(102, 255, 102, 0.5)',
              line: {
                color: 'transparent',
                width: 0
              }
            },
            // Stull Matte
            {
              type: 'path',
              layer: 'below',
              path: ' M 0.5,0.05 L0.5,0.39 L2.8,1.0 L4.0,1.0 Z',
              fillcolor: 'rgba(153, 255, 153, 0.5)',
              line: {
                color: 'transparent',
                width: 0
              }
            },
            // Stull Semi-Matte
            {
              type: 'path',
              layer: 'below',
              path: ' M 1.2,0.242 L4.0,1.0 L5.0,1.0 Z',
              fillcolor: 'rgba(204, 255, 204, 0.5)',
              line: {
                color: 'transparent',
                width: 0
              }
            },
            // Stull Under-fired
            {
              type: 'path',
              layer: 'below',
              path: ' M 1.75,0.0 L7.2,0.65 L7.2,0.0 Z',
              fillcolor: 'rgba(102, 255, 102, 0.5)',
              line: {
                color: 'transparent',
                width: 0
              }
            },
            // Stull Crazed
            {
              type: 'path',
              layer: 'below',
              path: ' M 0.5,0.0 L0.5,1.0 L1.67,1.0 L2.1,0.5 L2.38,0.25 L2.7,0.23 L3.3,0.25 L3.9,0.28 L4.2,0.29 L5.4,0.49 L7.2,0.615 L7.2,0 Z',
              fillcolor: 'rgba(221, 221, 221, 0.5)',
              line: {
                color: 'transparent',
                width: 0
              }
            },
            // Stull Q-line
            {
              type: 'path',
              layer: 'below',
              path: ' M 1.8,0.2 L4.2,0.6 L6.0,0.8 L7.2,0.92',
              fillcolor: 'transparent',
              line: {
                color: 'rgba(0, 0, 0, 0.5)',
                width: 0.5,
                dash: 'dot'
              }
            }
          ]

          layout.annotations = [
            {
              x: 1.9,
              y: 0.95,
              xref: 'x',
              yref: 'y',
              text: 'UNFUSED',
              showarrow: false
            },
            {
              x: 3.1,
              y: 0.95,
              xref: 'x',
              yref: 'y',
              text: 'MATTE',
              showarrow: false
            },
            {
              x: 4.3,
              y: 0.95,
              xref: 'x',
              yref: 'y',
              text: 'SEMI-MATTE',
              showarrow: false
            },
            {
              x: 4.3,
              y: 0.2,
              xref: 'x',
              yref: 'y',
              text: 'UNDERFIRED',
              showarrow: false
            },
            {
              x: 1.8,
              y: 0.2,
              xref: 'x',
              yref: 'y',
              text: 'CRAZED',
              showarrow: false
            }
          ]
        }

        return layout
      },
      reset: function (isNew = false) {
        if (this.isThreeAxes) {
          this.plotly3DChart(isNew)
        } else {
          this.plotly2DChart(isNew)
        }
      },
      getR2OFillColor: function (r2oTotal) {
        if (isNaN(r2oTotal)) {
          return ''
        }
        var index = Math.round((this.round(Number(r2oTotal) * 2, 1) / 2) * 100)
        switch (index) {
          case 100: return '#FF3333'
          case 95: return '#F4333D'
          case 90: return '#EA3347'
          case 85: return '#E03351'
          case 80: return '#D6335B'
          case 75: return '#CC3366'
          case 70: return '#C13370'
          case 65: return '#B7337A'
          case 60: return '#AD3384'
          case 55: return '#A3338E'
          case 50: return '#993399'
          case 45: return '#8E33A3'
          case 40: return '#8433AD'
          case 35: return '#7A33B7'
          case 30: return '#7033C1'
          case 25: return '#6633CC'
          case 20: return '#5B33D6'
          case 15: return '#5133E0'
          case 10: return '#4733EA'
          case 5: return '#3D33F4'
          case 0: return '#3333FF'
          default: return '#333333'
        }
      },
      getConeString: function (fromOrtonConeId, toOrtonConeId, isHtml = false) {
        var ortonCone = ''
        var deltaString = '\u0394'
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

    .ortonxx {  fill: #ffffff; }
</style>