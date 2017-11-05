<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title">Vue Plotly 3D UMF Charts</h1>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <div id="stull-chart-d3">
          <umf-plotly
                  :recipeData="jsondata.data"
                  :oxide1="form.oxide1"
                  :oxide2="form.oxide2"
                  :oxide3="form.oxide3"
                  :noZeros="form.noZeros"
                  :isThreeAxes="form.isThreeAxes"
                  :colortype="form.colortype"
                  :materialTypeId="form.glazeType"
                  :baseTypeId="baseTypeId"
                  :search="search"
                  :showRecipes="form.showrecipes"
                  :showCones="form.conecheck"
                  :showStullChart="form.showStullChart"
                  :chartHeight="chartHeight"
                  :chartWidth="chartWidth"
                  :axesColor="'#000000'"
                  :gridColor="'#999999'"
                  :currentRecipeId="4184"
                  :highlightedRecipeId="highlightedRecipeId"
                  :showModeBar="showModeBar"
                  v-on:clickedUmfPlotly="clicked"
          >
          </umf-plotly>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <div class="field is-horizontal">

          <b-field id="searchInput">
            <b-input v-model="textComputed"
                     placeholder="Keyword"></b-input>
          </b-field>

          <b-field id="glazeTypeGroup">
            <b-select v-model="form.glazeType">
              <option
                      v-for="option in glazeTypes"
                      :value="option.value"
                      :key="option.value"
              >
                {{ option.text }}
              </option>
            </b-select>
          </b-field>



          <b-field id="oxide1">
            <b-select v-model="form.oxide1">
              <option
                      v-for="option in oxides"
                      :value="option.value"
                      :key="option.value"
              >
                {{ option.text }}
              </option>
            </b-select>
          </b-field>

          <b-field id="oxide2">
            <b-select v-model="form.oxide2">
              <option
                      v-for="option in oxides"
                      :value="option.value"
                      :key="option.value"
              >
                {{ option.text }}
              </option>
            </b-select>
          </b-field>

          <b-field id="oxide3" v-if="form.isThreeAxes">
            <b-select v-model="form.oxide3">
              <option
                      v-for="option in oxides"
                      :value="option.value"
                      :key="option.value"
              >
                {{ option.text }}
              </option>
            </b-select>
          </b-field>

          <button class="button is-info" @click="resetForm">Reset Form</button>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <div class="field is-horizontal"  v-if="form.isThreeAxes">
          <b-checkbox v-model="form.noZeros">
            Recipes must contain <em>ALL</em> oxides (X, Y, and Z)
          </b-checkbox>
        </div>
        <div class="field is-horizontal">
          <b-checkbox v-model="form.isThreeAxes">
            3-Axis 3D
          </b-checkbox>
        </div>
        <div class="field is-horizontal" v-if="!form.isThreeAxes">
          <b-checkbox v-model="form.showStullChart">
            Show Stull Regions
          </b-checkbox>
        </div>
      </div>
      <div class="column" v-if="clickedRecipe">
        <article class="tile is-child notification is-info">
          <p v-html="clickedRecipe.text"></p>
          <a v-bind:href="'https://glazy.org/recipes/' + clickedRecipe.customdata"
             target="_blank" class="button">View on Glazy</a>
        </article>
      </div>
      <div class="column">
        <article @mouseover="highlightRecipe(10790)"
                 @mouseleave="unhighlightRecipe(10790)"
                 id='recipe-10790' class="tile is-child notification">
          <p>Hover Test: Recipe 10790</p>
        </article>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <table class="r2o-colors" v-if="form.colortype==='r2o'">
          <tbody>
          <tr>
            <td class="label">R<sub>2</sub>O:RO</td>
            <td class="r2ocolor-b-100">1:0</td>
            <td class="r2ocolor-b-95"></td>
            <td class="r2ocolor-b-90">.9:.1</td>
            <td class="r2ocolor-b-85"></td>
            <td class="r2ocolor-b-80">.8:.2</td>
            <td class="r2ocolor-b-75"></td>
            <td class="r2ocolor-b-70">.7:.3</td>
            <td class="r2ocolor-b-65"></td>
            <td class="r2ocolor-b-60">.6:.4</td>
            <td class="r2ocolor-b-55"></td>
            <td class="r2ocolor-b-50">.5:.5</td>
            <td class="r2ocolor-b-45"></td>
            <td class="r2ocolor-b-40">.4:.6</td>
            <td class="r2ocolor-b-35"></td>
            <td class="r2ocolor-b-30">.3:.7</td>
            <td class="r2ocolor-b-25"></td>
            <td class="r2ocolor-b-20">.2:.8</td>
            <td class="r2ocolor-b-15"></td>
            <td class="r2ocolor-b-10">.1:.9</td>
            <td class="r2ocolor-b-5"></td>
            <td class="r2ocolor-b-0">0:1</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script>
import UmfPlotly from '../components/UmfPlotly'
import StaticDataset from '../../static/data/all_api_output.edit.mini.json'

import Analysis from 'ceramicscalc-js/src/analysis/Analysis'
import MaterialTypes from 'ceramicscalc-js/src/material/MaterialTypes'
import GlazyConstants from 'ceramicscalc-js/src/helpers/GlazyConstants'

import _ from 'lodash'

export default {
  name: 'umf-chart',
  data () {
    return {
      jsondata: StaticDataset,
      currentValue: null,
      itemCount: 25,
      min: 10,
      max: 100,
      csv: null,
      selected: null,
      searchtext: '',
      clickedRecipe: null,
      highlightedRecipeId: 0,
      minSearchTextLength: 3,
      chartHeight: 400,
      chartWidth: 300,
      showModeBar: true,
      form: {
        conecheck: false,
        showStullChart: true,
        showrecipes: true,
        glazeType: 0,
        colortype: 'r2o',
        cone: null,
        oxide3: 'Fe2O3',
        oxide2: 'SiO2',
        oxide1: 'Al2O3',
        noZeros: true,
        isThreeAxes: false
      },
      oxides: Analysis.OXIDE_NAME_UNICODE_SELECT,
      baseTypeId: new MaterialTypes().GLAZE_TYPE_ID,
      glazeTypes: new MaterialTypes().GLAZES_SELECT,
      cones: new GlazyConstants().ORTON_CONES_SELECT,
      colortypes: [
        { text: 'R2O:RO', value: 'r2o' },
        { text: 'Orton Cone', value: 'cone' },
        { text: 'Glaze Type', value: 'glaze' }
      ],
      constants: new GlazyConstants()
    }
  },
  mounted () {
    this.chartHeight = document.getElementById('stull-chart-d3').clientHeight
    this.chartWidth = document.getElementById('stull-chart-d3').clientWidth
    window.addEventListener('resize', this.handleResize)
  },
  computed: {
    textComputed: {
      get () {
        return this.searchtext
      },
      set: _.debounce(function (newValue) {
        this.searchtext = newValue
      }, 1000)
    },
    search: function () {
      if (this.textComputed.length >= this.minSearchTextLength) {
        return this.textComputed
      }
      return ''
    }
  },
  methods: {
    resetForm: function () {
      this.form.conecheck = false
      this.form.showrecipes = true
      this.form.showStullChart = true
      this.form.glazeType = 0
      this.form.cone = null
      this.form.noZeros = true
      this.form.oxide1 = Analysis.OXIDE_NAME.Al2O3
      this.form.oxide2 = Analysis.OXIDE_NAME.SiO2
      this.form.oxide3 = Analysis.OXIDE_NAME.Fe2O3
      this.searchtext = ''
    },
    clicked: function (data) {
      this.clickedRecipe = data
      console.log(data)
    },
    handleResize: function () {
      this.chartHeight = document.getElementById('stull-chart-d3').clientHeight
      this.chartWidth = document.getElementById('stull-chart-d3').clientWidth
    },
    highlightRecipe: function (id) {
      this.highlightedRecipeId = id
      console.log('parent highlight' + this.highlightedRecipeId)
    },
    unhighlightRecipe: function (id) {
      this.highlightedRecipeId = 0
      console.log('parent unhighlight' + this.highlightedRecipeId)
    }
  },
  components: {
    UmfPlotly
  }
}
</script>

<style>

  #stull-chart-d3 {
    min-height: 400px;
    min-width: 300px;
  }

  .form-inline .form-group {
    margin-right: .175em;
    margin-bottom: .25em;
  }

  .orton-cone-colors tr td {
    font-size: .85em;
    padding: .2em;
    border: 1px solid white;
  }

  .r2o-colors tr td {
    color: #ffffff;
    font-size: .85em;
    line-height: 1em;
    padding: .2em;
    width: 2.5em;
    margin: 1px;
    text-align: center;
  }
  .r2o-colors tr td.label {
    color: #000000;
    white-space:nowrap;
    width: 60px;
  }


  .r2ocolor-b-100 { background-color: #FF0000; }
  .r2ocolor-b-95  { background-color: #FF1212; }
  .r2ocolor-b-90  { background-color: #FF2424; }
  .r2ocolor-b-85  { background-color: #FF3636; }
  .r2ocolor-b-80  { background-color: #FF4848; }
  .r2ocolor-b-75  { background-color: #FF5B5B; }
  .r2ocolor-b-70  { background-color: #FF6D6D; }
  .r2ocolor-b-65  { background-color: #FF7F7F; }
  .r2ocolor-b-60  { background-color: #FF9191; }
  .r2ocolor-b-55  { background-color: #FFA3A3; }
  .r2ocolor-b-50  { background-color: #FFB6B6; }
  .r2ocolor-b-45  { background-color: #FFC8C8; }
  .r2ocolor-b-40  { background-color: #FFDADA; }
  .r2ocolor-b-35  { background-color: #FFECEC; }
  .r2ocolor-b-30  { background-color: #FFFFFF; }
  .r2ocolor-b-25  { background-color: #D4D4FF; }
  .r2ocolor-b-20  { background-color: #AAAAFF; }
  .r2ocolor-b-15  { background-color: #7F7FFF; }
  .r2ocolor-b-10  { background-color: #5555FF; }
  .r2ocolor-b-5   { background-color: #2A2AFF; }
  .r2ocolor-b-0   { background-color: #0000FF; }
  /*
  .r2ocolor-b-100 { background-color: #FF0000; }
  .r2ocolor-b-95  { background-color: #FF1212; }
  .r2ocolor-b-90  { background-color: #FF2424; }
  .r2ocolor-b-85  { background-color: #FF3636; }
  .r2ocolor-b-80  { background-color: #FF4848; }
  .r2ocolor-b-75  { background-color: #FF5B5B; }
  .r2ocolor-b-70  { background-color: #FF6D6D; }
  .r2ocolor-b-65  { background-color: #FF7F7F; }
  .r2ocolor-b-60  { background-color: #FF9191; }
  .r2ocolor-b-55  { background-color: #FFA3A3; }
  .r2ocolor-b-50  { background-color: #FFB6B6; }
  .r2ocolor-b-45  { background-color: #FFC8C8; }
  .r2ocolor-b-40  { background-color: #FFDADA; }
  .r2ocolor-b-35  { background-color: #FFECEC; }
  .r2ocolor-b-30  { background-color: #FFFFFF; }
  .r2ocolor-b-25  { background-color: #D4D4FF; }
  .r2ocolor-b-20  { background-color: #AAAAFF; }
  .r2ocolor-b-15  { background-color: #7F7FFF; }
  .r2ocolor-b-10  { background-color: #5555FF; }
  .r2ocolor-b-5   { background-color: #2A2AFF; }
  .r2ocolor-b-0   { background-color: #0000FF; }
    /*
  .orton-b-022 {  background-color: #cc0000; }
  .orton-b-021 {  background-color: #d30000; }
  .orton-b-020 {  background-color: #d60000; }
  .orton-b-019 {  background-color: #d90000; }
  .orton-b-018 {  background-color: #dd0000; }
  .orton-b-017 {  background-color: #e30000; }
  .orton-b-016 {  background-color: #e60000; }
  .orton-b-015 {  background-color: #e90000; }
  .orton-b-014 {  background-color: #ee0000; }
  .orton-b-013 {  background-color: #f60000; }
  .orton-b-012 {  background-color: #ff0000; }
  .orton-b-011 {  background-color: #ff2200; }
  .orton-b-010 {  background-color: #ff4400; }
  .orton-b-09 {  background-color: #ff5500; }
  .orton-b-08 {  background-color: #ff6600; }
  .orton-b-07 {  background-color: #ff7700; }
  .orton-b-06 {  background-color: #ff8800; }
  .orton-b-05-1-2 {  background-color: #ff9900; }
  .orton-b-05 {  background-color: #ffaa00; }
  .orton-b-04 {  background-color: #ffbb00; }
  .orton-b-03 {  background-color: #ffcc00; }
  .orton-b-02 {  background-color: #ffdd00; }
  .orton-b-01 {  background-color: #ffee00; }
  .orton-b-1 {  background-color: #ffff00; }
  .orton-b-2 {  background-color: #ffff22; }
  .orton-b-3 {  background-color: #ffff44; }
  .orton-b-4 {  background-color: #ffff66; }
  .orton-b-5 {  background-color: #ffff88; }
  .orton-b-5-1-2 {  background-color: #ffffaa; }
  .orton-b-6 {  background-color: #ffffbb; }
  .orton-b-7 {  background-color: #ffffcc; }
  .orton-b-8 {  background-color: #ffffdd; }
  .orton-b-9 {  background-color: #ffffee; }
  .orton-b-10 {  background-color: #ffffff; }
  .orton-b-11 {  background-color: #ffffff; }
  .orton-b-12 {  background-color: #ffffff; }
  .orton-b-13 {  background-color: #ffffff; }
  .orton-b-14 {  background-color: #ffffff; }
  */

</style>