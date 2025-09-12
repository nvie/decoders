<template>
  <div class="decoder-signature">
    <strong> {{ props.name }} </strong
    ><span v-if="props.params"
      >(<span v-for="(param, index) in props.params" :key="index">
        {{ param.name }}: <span class="type">{{ param.type }}</span>
        <span v-if="index < props.params.length - 1">, </span> </span
      >)</span
    ><span v-if="props.outputType"
      >:
      <span class="decoder-wrapper"
        >Decoder&lt;<span class="type">{{ props.outputType }}</span
        >&gt;</span
      ></span
    >
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, withDefaults } from 'vue';

type TypeExpr = string;

interface TypeParam {
  name: string;
  extends: TypeExpr;
}

interface Param {
  name: string;
  type: TypeExpr;
}

interface Props {
  name: string;
  typeParams?: TypeParam[];
  params?: Param[];
  outputType: TypeExpr;
}

const props = withDefaults(defineProps<Props>(), {
  typeParams: () => [],
});

onMounted(() => {
  // Any logic here
});

onUnmounted(() => {
  // Cleanup handled by onMounted return function
});
</script>

<style scoped>
.decoder-signature {
}

.type {
  font-style: italic;
  color: teal;
}

.decoder-wrapper {
  font-style: italic;
  color: darkgray;
}
</style>
