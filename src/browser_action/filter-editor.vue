<template>
  <div>
    <template v-for="(savedCondition, index) in savedConditions">
      <div v-bind:key="index">
        <input type="text" v-bind:id="'savedConditionName' + index" v-bind:value="savedCondition.name" v-on:change="changeName(index)" />
        <button v-on:click="movePrevious(index)" v-bind:disabled="index == 0">↑</button>
        <button v-on:click="moveNext(index)" v-bind:disabled="index == savedConditions.length - 1">↓</button>
        <button v-on:click="deleteSavedCondition(index)">{{ getMessage('filter_editor_delete_button') }}</button>
      </div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue';
import { I18n } from '../static/common/I18n.js';

let app;

export default Vue.extend({
  data: function () {
    return {
      savedConditions: [],
    };
  },
  methods: {
    getMessage: I18n.getMessage,
    changeName: function (index) {
      this.savedConditions[index].name = document.getElementById('savedConditionName' + index).value;
      this.save();
    },
    movePrevious: function (index) {
      const element = this.savedConditions.splice(index, 1);
      this.savedConditions.splice(index - 1, 0, element[0]);
      this.save();
    },
    moveNext: function (index) {
      const element = this.savedConditions.splice(index, 1);
      this.savedConditions.splice(index + 1, 0, element[0]);
      this.save();
    },
    deleteSavedCondition: function (index) {
      this.savedConditions.splice(index, 1);
      this.save();
    },
    load: function () {
      const savedConditions = app.getSavedConditions();
      this.savedConditions = savedConditions;
    },
    save: function () {
      app.saveSavedConditions(this.savedConditions);
    },
    initialize: function (a) {
      app = a;
    },
  },
});
</script>

<style scoped></style>
