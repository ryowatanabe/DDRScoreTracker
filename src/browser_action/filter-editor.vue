<template>
  <div>
    <template v-for="(savedCondition, index) in savedConditions" :key="index">
      <div>
        <input :id="'savedConditionName' + index" type="text" :value="savedCondition.name" @change="changeName(index)" />
        <button :disabled="index == 0" @click="movePrevious(index)">↑</button>
        <button :disabled="index == savedConditions.length - 1" @click="moveNext(index)">↓</button>
        <button @click="deleteSavedCondition(index)">{{ getMessage('filter_editor_delete_button') }}</button>
      </div>
    </template>
  </div>
</template>

<script>
import { I18n } from '../static/common/I18n.js';

let app;

export default {
  data: function () {
    return {
      savedConditions: [],
    };
  },
  methods: {
    getMessage(key) {
      return I18n.getMessage(key);
    },
    changeName(index) {
      this.savedConditions[index].name = document.getElementById('savedConditionName' + index).value;
      this.save();
    },
    movePrevious(index) {
      const element = this.savedConditions.splice(index, 1);
      this.savedConditions.splice(index - 1, 0, element[0]);
      this.save();
    },
    moveNext(index) {
      const element = this.savedConditions.splice(index, 1);
      this.savedConditions.splice(index + 1, 0, element[0]);
      this.save();
    },
    deleteSavedCondition(index) {
      this.savedConditions.splice(index, 1);
      this.save();
    },
    load() {
      const savedConditions = app.getSavedConditions();
      this.savedConditions = savedConditions;
    },
    save() {
      app.saveSavedConditions(this.savedConditions);
    },
    initialize(a) {
      app = a;
    },
  },
};
</script>

<style scoped></style>
