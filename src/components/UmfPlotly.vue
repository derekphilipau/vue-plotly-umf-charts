<template>
</template>
<script>
  import Plotly from 'plotly.js/dist/plotly-gl3d'
  // import Plotly from plotly
  import Analysis from 'ceramicscalc-js/src/analysis/Analysis'
  import MaterialTypes from 'ceramicscalc-js/src/material/MaterialTypes'
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
      materialTypeId: {
        type: Number,
        default: null
      },
      baseTypeId: {
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
      currentRecipeId: {
        type: Number,
        default: 0
      },
      highlightedRecipeId: {
        type: Number,
        default: 0
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
      showModeBar: {
        type: Boolean,
        default: true
      },
      axesColor: {
        type: String,
        default: '#999999'
      },
      gridColor: {
        type: String,
        default: '#999999'
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
      chartWidth: {
        type: Number,
        default: 200
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
        materialTypes: new MaterialTypes(),
        minSearchTextLength: 3,
        defaultMarkerSize: 8,
        currentMarkerSize: 12,
        highlightedMarkerSize: 14,
        analysisMarkerSize: 8,
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
          displayModeBar: this.showModeBar,
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
      materialTypeId: function (newValue) {
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
      },
      chartWidth: function (newValue) {
        Plotly.relayout('stull-chart-d3', { width: this.chartWidth, height: this.chartHeight })
      },
      chartHeight: function (newValue) {
        Plotly.relayout('stull-chart-d3', { width: this.chartWidth, height: this.chartHeight })
      },
      highlightedRecipeId: function (newValue) {
        this.highlightRecipe()
      },
      currentRecipeId: function (newValue) {
        this.reset(true)
      }
    },
    computed: {
      hasdata: function () {
        if (this.filteredData && this.filteredData.length > 0) {
          return true
        }
        return false
      },
      filteredData: function () {
        // If we directly use this.recipeData var, Vue gets BUSY..
        var mydata = this.recipeData

        if (!mydata || mydata.length <= 0) {
          return null
        }

        var mylen = mydata.length
        var filteredData = {
          mode: 'markers',
          marker: {
            symbol: [],
            color: [],
            size: [],
            line: {
              width: 0.5,
              color: 'rgb(0,0,0,1)'
            },
            opacity: 1
          },
          hoverinfo: 'text',
          x: [],
          y: [],
          z: [],
          maxX: 0,
          maxY: 0,
          maxZ: 0,
          minX: 100,
          minY: 100,
          minZ: 100,
          name: [],
          text: [],
          customdata: []
        }

        var matrix = [] // Keep track of collisions

        if (this.isThreeAxes) {
          filteredData.type = 'scatter3d'
        } else {
          filteredData.type = 'scatter'
        }

        var materialTypeBranch = []
        if (this.materialTypeId &&
          this.baseTypeId === this.materialTypes.GLAZE_TYPE_ID) {
          if (this.materialTypes.GLAZE_TYPE_TREE[this.materialTypeId] !== 'undefined') {
            materialTypeBranch = this.materialTypes.GLAZE_TYPE_TREE[this.materialTypeId]
          }
        }

        var searchString = null
        if (this.search && this.search.length >= this.minSearchTextLength) {
          searchString = this.search.toLowerCase()
        }

        for (var i = 0; i < mylen; i++) {
          if (materialTypeBranch.length > 0) {
            if (materialTypeBranch.indexOf(mydata[i].materialTypeId) < 0) {
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
          var xValOrig = 0.0
          var yValOrig = 0.0
          var zValOrig = 0.0
          if (this.isThreeAxes) {
            xVal = parseFloat(mydata[i].analysis.umfAnalysis[this.oxide3])
            zVal = parseFloat(mydata[i].analysis.umfAnalysis[this.oxide1])
            yVal = parseFloat(mydata[i].analysis.umfAnalysis[this.oxide2])

            if (isNaN(xVal)) { xVal = 0.0 }
            if (isNaN(zVal)) { zVal = 0.0 }
            if (isNaN(yVal)) { yVal = 0.0 }

            xValOrig = xVal
            yValOrig = yVal
            zValOrig = zVal

            if (this.noZeros && (xVal <= 0 || yVal <= 0 || zVal <= 0)) {
              continue
            }

            // Adjust coordinates using stacked collision
            var point3d = xVal.toFixed(2) + ':' + yVal.toFixed(2) + ':' + zVal.toFixed(2)
            if (point3d in matrix) {
              var tens = Math.floor(matrix[point3d] / 10)
              var angle = matrix[point3d] * 0.63
              zVal = zVal + 0.005 * tens * Math.cos(angle)
              yVal = yVal + 0.005 * tens * Math.sin(angle)
              matrix[point3d] += 1
            } else {
              matrix[point3d] = 1
            }
          } else {
            xVal = parseFloat(mydata[i].analysis.umfAnalysis[this.oxide2])
            yVal = parseFloat(mydata[i].analysis.umfAnalysis[this.oxide1])

            if (isNaN(xVal)) { xVal = 0.0 }
            if (isNaN(yVal)) { yVal = 0.0 }

            xValOrig = xVal
            yValOrig = yVal

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
              matrix[point] = 0.001
            }
          }

          var currentLength = filteredData.x.length
          filteredData.x[currentLength] = xVal
          filteredData.y[currentLength] = yVal
          filteredData.z[currentLength] = zVal

          if (xVal > filteredData.maxX) {
            filteredData.maxX = xVal
          }
          if (yVal > filteredData.maxY) {
            filteredData.maxY = yVal
          }
          if (zVal > filteredData.maxZ) {
            filteredData.maxZ = zVal
          }

          if (xVal < filteredData.minX) {
            filteredData.minX = xVal
          }
          if (yVal < filteredData.minY) {
            filteredData.minY = yVal
          }
          if (zVal < filteredData.minZ) {
            filteredData.minZ = zVal
          }

          var tooltip = ''
          var cones = this.getConeString(mydata[i].foci, mydata[i].toci, false)
          if (cones) {
            tooltip += cones + ' '
          }

          if (mydata[i].name) {
            if (mydata[i].name.length > 22) {
              tooltip += mydata[i].name.substr(0, 22) + '...'
            } else {
              tooltip += mydata[i].name
            }
          }

          if (mydata[i].materialTypeId &&
              this.materialTypes.LOOKUP[mydata[i].materialTypeId]) {
            tooltip += '<br><span style="color:#444444">' +
              this.materialTypes.LOOKUP[mydata[i].materialTypeId] +
              '</span>'
          }
          tooltip += '<br>'
          if (this.isThreeAxes) {
            tooltip += Number(yValOrig).toFixed(2) + ' ' +
              Analysis.OXIDE_NAME_DISPLAY[this.oxide2] + ' ' +
              Number(zValOrig).toFixed(2) + ' ' +
              Analysis.OXIDE_NAME_DISPLAY[this.oxide1] + ' ' +
              Number(xValOrig).toFixed(2) + ' ' +
              Analysis.OXIDE_NAME_DISPLAY[this.oxide3]
          } else {
            tooltip += Number(xValOrig).toFixed(2) +
              ' ' + Analysis.OXIDE_NAME_DISPLAY[this.oxide2] + ' ' +
              Number(yValOrig).toFixed(2) + ' ' +
              Analysis.OXIDE_NAME_DISPLAY[this.oxide1]
          }
          tooltip += '<br><b>' +
            Number(mydata[i].analysis.umfAnalysis.SiO2Al2O3Ratio).toFixed(2) +
            '</b> SiO<sub>2</sub>:Al<sub>2</sub>O<sub>3</sub>' +
            '<br><b>' +
            Number(mydata[i].analysis.umfAnalysis.R2OTotal).toFixed(2) + ':' +
            Number(mydata[i].analysis.umfAnalysis.ROTotal).toFixed(2) +
            '</b> R<sub>2</sub>O:RO'

          filteredData.text[currentLength] = tooltip
          filteredData.customdata[currentLength] = mydata[i].id
          if (this.currentRecipeId &&
            this.currentRecipeId === mydata[i].id) {
            filteredData.marker.symbol[currentLength] = 'x'
            filteredData.marker.size[currentLength] =
              this.currentMarkerSize
          } else if (mydata[i].isAnalysis) {
            filteredData.marker.symbol[currentLength] = 'diamond'
            filteredData.marker.size[currentLength] =
              this.analysisMarkerSize
          } else {
            filteredData.marker.symbol[currentLength] = 'circle'
            filteredData.marker.size[currentLength] =
              this.defaultMarkerSize
          }
          filteredData.marker.color[currentLength] =
            this.getR2OFillColor(mydata[i].analysis.umfAnalysis.R2OTotal)
        }

        console.log('Number of Recipes: ' + filteredData.x.length)

        return filteredData
      }
    },
    methods: {
      plotly3DChart: function (isNew = false) {
        var data = [this.filteredData]
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
        var data = [this.filteredData]
        if (isNew) {
          Plotly.newPlot('stull-chart-d3', data, this.get2DLayout(data), this.defaultPlotlyConfiguration)
          this.myPlot.on('plotly_click', function (data) {
            if (data.points && data.points[0].customdata) {
              this.$emit('clickedUmfPlotly', data.points[0])
            }
          }.bind(this))
        } else {
          Plotly.update('stull-chart-d3', data, this.get2DLayout(data))
        }
      },
      get3DLayout: function () {
        var layout = {
          scene: {
            xaxis: {
              title: this.oxide3,
              gridcolor: this.gridColor,
              gridwidth: 1,
              zerolinecolor: this.gridColor,
              zerolinewidth: 1
            },
            yaxis: {
              title: this.oxide2,
              gridcolor: this.gridColor,
              gridwidth: 1,
              zerolinecolor: this.gridColor,
              zerolinewidth: 1
            },
            zaxis: {
              title: this.oxide1,
              gridcolor: this.gridColor,
              gridwidth: 1,
              zerolinecolor: this.gridColor,
              zerolinewidth: 1
            },
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
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          height: this.chartHeight
        }
        return layout
      },
      get2DLayout: function (data) {
        var layout = {
          hovermode: 'closest',
          title: 'Recipe Info',
          margin: {
            l: 40,
            r: 0,
            b: 30,
            t: 0
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          height: this.chartHeight,
          xaxis: {
            title: Analysis.OXIDE_NAME_UNICODE[this.oxide2],
            titlefont: {
              family: 'Arial, sans-serif',
              size: 14,
              color: this.axesColor
            },
            showticklabels: true,
            tickangle: 0,
            tickfont: {
              family: 'Arial, sans-serif',
              size: 10,
              color: this.axesColor
            },
            gridcolor: this.gridColor,
            gridwidth: 1,
            zerolinecolor: this.gridColor,
            zerolinewidth: 1,
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
              size: 14,
              color: this.axesColor
            },
            showticklabels: true,
            tickangle: 0,
            tickfont: {
              family: 'Arial, sans-serif',
              size: 10,
              color: this.axesColor
            },
            gridcolor: this.gridColor,
            gridwidth: 1,
            zerolinecolor: this.gridColor,
            zerolinewidth: 1,
            autotick: true,
            ticks: 'inside',
            tick0: 0,
            ticklen: 0,
            tickwidth: 0
          }
        }

        if (this.showStullChart &&
          this.oxide2 === Analysis.OXIDE_NAME.SiO2 &&
          this.oxide1 === Analysis.OXIDE_NAME.Al2O3 &&
          this.baseTypeId === this.materialTypes.GLAZE_TYPE_ID) {
          // Limits of Stull chart are x: 0.5, 7.2, y: 0, 1

          if (this.filteredData) {
            if (this.filteredData.maxX < 7.2) {
              if (this.filteredData.minX < 0.5) {
                layout.xaxis.range = [0, 7.2]
              } else {
                layout.xaxis.range = [0.5, 7.2]
              }
            }
            if (this.filteredData.maxY < 1) {
              layout.yaxis.range = [0, 1]
            }
          }
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

          // Don't show Stull labels if limits are too great.
          // if (data.maxX > 10 || data.maxY > 2) {
          layout.annotations = [
            {
              x: 1.8,
              y: 0.89,
              xref: 'x',
              yref: 'y',
              text: 'UNFUSED',
              showarrow: false,
              textangle: -35
            },
            {
              x: 2.95,
              y: 0.89,
              xref: 'x',
              yref: 'y',
              text: 'MATTE',
              showarrow: false,
              textangle: -35
            },
            {
              x: 3.95,
              y: 0.89,
              xref: 'x',
              yref: 'y',
              text: 'SEMI-MATTE',
              showarrow: false,
              textangle: -35
            },
            {
              x: 4.3,
              y: 0.2,
              xref: 'x',
              yref: 'y',
              text: 'UNDERFIRED',
              showarrow: false,
              textangle: -15
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
        // http://www.perbang.dk/rgbgradient/
        // 7 & 15 steps
        var index = Math.round((this.round(Number(r2oTotal) * 2, 1) / 2) * 100)
        switch (index) {
          case 100: return '#FF0000'
          case 95: return '#FF1212'
          case 90: return '#FF2424'
          case 85: return '#FF3636'
          case 80: return '#FF4848'
          case 75: return '#FF5B5B'
          case 70: return '#FF6D6D'
          case 65: return '#FF7F7F'
          case 60: return '#FF9191'
          case 55: return '#FFA3A3'
          case 50: return '#FFB6B6'
          case 45: return '#FFC8C8'
          case 40: return '#FFDADA'
          case 35: return '#FFECEC'
          case 30: return '#FFFFFF'
          case 25: return '#D4D4FF'
          case 20: return '#AAAAFF'
          case 15: return '#7F7FFF'
          case 10: return '#5555FF'
          case 5: return '#2A2AFF'
          case 0: return '#0000FF'
          default: return '#333333'

          /*
           case 100: return '#ff0000'
           case 95: return '#ec0012'
           case 90: return '#da0024'
           case 85: return '#c80036'
           case 80: return '#b60048'
           case 75: return '#a3005b'
           case 70: return '#91006d'
           case 65: return '#7f007f'
           case 60: return '#6d0091'
           case 55: return '#5b00a3'
           case 50: return '#4800b6'
           case 45: return '#3600c8'
           case 40: return '#2400da'
           case 35: return '#1200ec'
           case 30: return '#0000ff'
           case 25: return '#002ad4'
           case 20: return '#0055aa'
           case 15: return '#007f7f'
           case 10: return '#00aa55'
           case 5: return '#00d42a'
           case 0: return '#00ff00'
           default: return '#cccccc'
           //
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
          */
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
      },
      highlightRecipe () {
        if (this.filteredData.customdata &&
          this.filteredData.customdata.length > 0) {
          var len = this.filteredData.customdata.length
          var markerSizes = []
          for (var i = 0; i < len; i++) {
            var recipeId = Number(this.filteredData.customdata[i])
            if (this.highlightedRecipeId &&
              this.highlightedRecipeId === recipeId) {
              markerSizes[i] =
                this.highlightedMarkerSize
            } else {
              if (recipeId === this.currentRecipeId) {
                markerSizes[i] =
                  this.currentMarkerSize
              } else {
                markerSizes[i] =
                  this.defaultMarkerSize
              }
            }
          }
          Plotly.restyle('stull-chart-d3', 'marker.size', [markerSizes])
        }
      }
    }
  }
</script>

<style>

</style>