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
                  :recipeData="this.jsondata.data"
                  :xoxide="this.form.xoxide"
                  :yoxide="this.form.yoxide"
                  :zoxide="this.form.zoxide"
                  :nozeros="this.form.nozeros"
                  :colortype="this.form.colortype"
                  :showRecipes="this.form.showrecipes"
                  :showCones="this.form.conecheck"
                  :showStullHeatmap="this.form.showstullheatmap"
                  :showStullChart="this.form.showstullchart"
                  :showZoomButtons="true"
          >
          </umf-plotly>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <div class="field is-horizontal">
          <b-field id="xaxis" label="X axis">
            <b-select v-model="form.xoxide">
              <option
                      v-for="option in oxides"
                      :value="option.value"
                      :key="option.value"
              >
                {{ option.text }}
              </option>
            </b-select>
          </b-field>

          <b-field id="yaxis" label="Y axis">
            <b-select v-model="form.yoxide">
              <option
                      v-for="option in oxides"
                      :value="option.value"
                      :key="option.value"
              >
                {{ option.text }}
              </option>
            </b-select>
          </b-field>

          <b-field id="zaxis" label="Z axis">
            <b-select v-model="form.zoxide">
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
        <div class="field is-horizontal">
          <b-checkbox v-model="form.nozeros">
            Recipes must contain <em>ALL</em> oxides (X, Y, and Z)
          </b-checkbox>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import UmfPlotly from '../components/UmfPlotly'
import StaticDataset from '../../static/data/all_api_output.edit.mini.json'

import Analysis from 'ceramicscalc-js/src/analysis/Analysis'
import GlazyConstants from 'ceramicscalc-js/src/helpers/GlazyConstants'
import OrtonCones from 'ceramicscalc-js/src/helpers/OrtonCones'

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
      minSearchTextLength: 3,
      form: {
        conecheck: false,
        showstullheatmap: false,
        showstullchart: true,
        showrecipes: true,
        glazetype: 0,
        colortype: 'r2o',
        cone: null,
        xoxide: 'Fe2O3',
        yoxide: 'SiO2',
        zoxide: 'Al2O3',
        nozeros: false
      },
      oxides: Analysis.OXIDE_NAME_UNICODE_SELECT,
      glazetypes: new GlazyConstants().GLAZE_TYPES_SELECT,
      cones: [
        { value: null, text: 'Temp' },
        { value: 'low', text: 'Low' },
        { value: 'mid', text: 'Mid' },
        { value: 'high', text: 'High' }
      ].concat(new OrtonCones().DISPLAY_CONES),
      colortypes: [
        { text: 'R2O:RO', value: 'r2o' },
        { text: 'Orton Cone', value: 'cone' },
        { text: 'Glaze Type', value: 'glaze' }
      ],
      constants: new GlazyConstants()
    }
  },
  mounted () {
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
      this.form.showstullheatmap = false
      this.form.showstullchart = true
      this.form.glazetype = 0
      this.form.cone = null
      this.form.xoxide = Analysis.OXIDE_NAME.Fe2O3
      this.form.yoxide = Analysis.OXIDE_NAME.SiO2
      this.form.zoxide = Analysis.OXIDE_NAME.Al2O3
      this.searchtext = ''
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

  .r2o-colors tr td {
    font-size: .85em;
    padding: .2em;
    width: 2.5em;
    border: 1px solid white;
  }
  .r2o-colors tr td.label {
    white-space:nowrap;
  }

  .r2ocolor-b-100 { background-color: rgba(195, 150, 150, 1); }
  .r2ocolor-b-95  { background-color: rgba(210, 150, 150, 1); }
  .r2ocolor-b-90  { background-color: rgba(225, 150, 150, 1); }
  .r2ocolor-b-85  { background-color: rgba(240, 150, 150, 1); }
  .r2ocolor-b-80  { background-color: rgba(255, 150, 150, 1); }
  .r2ocolor-b-75  { background-color: rgba(255, 165, 150, 1); }
  .r2ocolor-b-70  { background-color: rgba(255, 180, 150, 1); }
  .r2ocolor-b-65  { background-color: rgba(255, 195, 150, 1); }
  .r2ocolor-b-60  { background-color: rgba(255, 210, 150, 1); }
  .r2ocolor-b-55  { background-color: rgba(255, 225, 150, 1); }
  .r2ocolor-b-50  { background-color: rgba(255, 240, 150, 1); }
  .r2ocolor-b-45  { background-color: rgba(255, 255, 165, 1); }
  .r2ocolor-b-40  { background-color: rgba(255, 255, 195, 1); }
  .r2ocolor-b-35  { background-color: rgba(255, 255, 225, 1); }
  .r2ocolor-b-30  { background-color: rgba(255, 255, 255, 1); }
  .r2ocolor-b-25  { background-color: rgba(240, 240, 255, 1); }
  .r2ocolor-b-20  { background-color: rgba(225, 225, 255, 1); }
  .r2ocolor-b-15  { background-color: rgba(210, 210, 255, 1); }
  .r2ocolor-b-10  { background-color: rgba(195, 195, 255, 1); }
  .r2ocolor-b-5   { background-color: rgba(180, 180, 255, 1); }
  .r2ocolor-b-0   { background-color: rgba(165, 165, 255, 1); }

</style>