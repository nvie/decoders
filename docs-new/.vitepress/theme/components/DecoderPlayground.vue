<template>
  <div class="decoder-playground">
    <div class="decoder-header">
      <label class="decoder-label">Decoder:</label>
      <input
        v-model="currentDecoderName"
        @input="onDecoderChange"
        class="decoder-input"
        placeholder="Enter decoder name..."
      />
    </div>

    <table class="playground-table">
      <thead>
        <tr>
          <th>Input</th>
          <th>Output</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(example, index) in examples" :key="index">
          <td class="input-cell">
            <input
              v-model="example.input"
              @input="evaluateExample(index)"
              class="input-field"
              :class="{ 'syntax-error': example.syntaxError }"
              :placeholder="example.placeholder || 'Enter JavaScript expression...'"
            />
            <div v-if="example.syntaxError" class="syntax-error-message">
              {{ example.syntaxError }}
            </div>
          </td>
          <td
            class="output-cell"
            :class="{ error: example.result?.error, success: example.result?.success }"
          >
            <div v-if="example.result?.loading" class="loading">Evaluating...</div>
            <div v-else-if="example.result?.error" class="error-result">
              <span class="error-badge">rejected</span>
              <pre class="error-message">{{ example.result.error }}</pre>
            </div>
            <div v-else-if="example.result?.success" class="success-result">
              <span class="success-badge">accepted</span>
              <span class="output-value">{{ formatValue(example.result.value) }}</span>
            </div>
            <div v-else class="empty-result">—</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="controls">
      <button @click="addExample" class="control-button add-button">Add Example</button>
      <button @click="resetExamples" class="control-button reset-button">
        Reset Examples
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import * as decodersModule from 'decoders';
import 'ses';

interface Props {
  decoderName: string;
  defaultExamples?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  defaultExamples: () => [],
});

interface ExampleData {
  input: string;
  placeholder?: string;
  result?: {
    loading?: boolean;
    success?: boolean;
    value?: any;
    error?: string;
  };
  syntaxError?: string | null;
}

const examples = ref<ExampleData[]>([]);
const currentDecoderName = ref(props.decoderName);

function getDefaultExamplesForDecoder(decoderName: string): string[] {
  console.log('getDefaultExamplesForDecoder called with:', decoderName);
  const defaultExamplesByDecoder: Record<string, string[]> = {
    // Basic types
    string: ['"hello world"', '"🚀"', '""', '123', 'true', 'null'],
    number: ['123', '-3.14', 'Infinity', 'NaN', '"not a number"', 'null'],
    integer: ['123', '-42', '3.14', '"not number"', 'null'],
    boolean: ['true', 'false', '"not boolean"', '1', 'null'],
    date: ['new Date()', '"2023-01-01"', '"invalid date"', '1234567890'],
    null_: ['null', 'undefined', '"not null"', '0'],
    undefined_: ['undefined', 'null', 'false', '"hello world"'],
    optional: ['"hello"', 'undefined', 'null', '42'],
    'optional(string)': ['"hello"', 'undefined', 'null', '42', 'true'],
    nullable: ['"hello"', 'null', 'undefined', '42'],
    'nullable(string)': ['"hello"', 'null', 'undefined', '42', 'true'],
    nullish: ['"hello"', 'null', 'undefined', '42'],
    'nullish(string)': ['"hello"', 'null', 'undefined', '42', 'true'],
    unknown: ['"hello"', 'false', 'undefined', '[1, 2]'],

    // Arrays
    array: ['["hello", "world"]', '[]', '["hello", 1.2]', '"not array"'],
    'array(string)': [
      '["hello", "world"]',
      '["foo", "bar"]',
      '[]',
      '[1, 2, 3]',
      '"not array"',
    ],
    nonEmptyArray: ['["hello", "world"]', '[]', '["hello", 1.2]', '"not array"'],
    'nonEmptyArray(string)': [
      '["hello", "world"]',
      '["foo"]',
      '[]',
      '[1, 2]',
      '"not array"',
    ],
    poja: ['[1, "hi", true]', '["hello", "world"]', '[]', '{}'],
    tuple: ['["hello", 1.2]', '[]', '["hello", "world"]', '["a", 1, "c"]'],
    'tuple(string, number)': [
      '["hello", 42]',
      '["foo", 3.14]',
      '[]',
      '["hello", "world"]',
      '["a", 1, "c"]',
    ],

    // Objects
    object: ['{ x: 1, y: 2 }', '{ x: 1, y: 2, z: 3 }', '{ x: 1 }', '"not object"'],
    'object({ x: number })': [
      '{ x: 42 }',
      '{ x: 42, y: "extra" }',
      '{ y: 42 }',
      '"not object"',
    ],
    exact: ['{ x: 1, y: 2 }', '{ x: 1, y: 2, z: 3 }', '{ x: 1 }', '"not object"'],
    'exact({ x: number })': [
      '{ x: 42 }',
      '{ x: 42, y: "extra" }',
      '{ y: 42 }',
      '"not object"',
    ],
    inexact: ['{ x: 1, y: 2 }', '{ x: 1, y: 2, z: 3 }', '{ x: 1 }', '"not object"'],
    'inexact({ x: number })': [
      '{ x: 42 }',
      '{ x: 42, y: "extra" }',
      '{ y: 42 }',
      '"not object"',
    ],

    // Either
    either: ['"hello"', '123', 'true', '[]'],
    'either(string, number)': ['"hello"', '123', 'true', 'null'],

    // Composition
    compose: ['"HELLO"', '"hello"', '"Hello"', '123'],
    'compose(string, x => x.toUpperCase())': ['"hello"', '"WORLD"', '123', 'null'],
    lazy: ['{ recursive: null }', '{ recursive: { recursive: null }}'],
    oneOf: ['"red"', '"blue"', '"green"', '"yellow"'],
    'oneOf(["red", "blue"])': ['"red"', '"blue"', '"green"', '"yellow"'],

    // Transformations
    'string.transform(x => x.toUpperCase())': ['"hello"', '"world"', '123', 'null'],
  };

  const result = defaultExamplesByDecoder[decoderName] || [
    '"example input"',
    'null',
    '{}',
    '[]',
    '123',
    'true',
  ];
  console.log('getDefaultExamplesForDecoder result:', result);
  return result;
}

function onDecoderChange() {
  // Re-evaluate existing examples instead of resetting them
  nextTick(() => {
    examples.value.forEach((_, index) => evaluateExample(index));
  });
}

// Initialize SES for secure compartment evaluation (only once)
try {
  lockdown();
} catch (error) {
  // Ignore if already locked down
  if (!(error instanceof Error && error.message.includes('Already locked down'))) {
    throw error;
  }
}

// Compartment 1: For decoder expressions (array(string), object({ x: number }), etc.)
const decoderCompartment = new Compartment({
  // All decoders from the library
  ...Object.fromEntries(
    Object.entries(decodersModule).map(([key, value]) => [key, harden(value)]),
  ),
  // Basic utilities for building decoder expressions
  Math: harden(Math),
  Number: harden(Number),
  String: harden(String),
  Boolean: harden(Boolean),
  Array: harden(Array),
  Object: harden(Object),
  JSON: harden(JSON),
  RegExp: harden(RegExp),
});

// Compartment 2: For input value expressions (["hello", "world"], { x: 42 }, etc.)
const valueCompartment = new Compartment({
  // Basic constructors for creating JS values
  String: harden(String),
  Number: harden(Number),
  Boolean: harden(Boolean),
  Array: harden(Array),
  Object: harden(Object),
  Date: harden(Date),
  RegExp: harden(RegExp),
  Map: harden(Map),
  Set: harden(Set),
  WeakMap: harden(WeakMap),
  WeakSet: harden(WeakSet),
  URL: harden(URL),
  URLSearchParams: harden(URLSearchParams),
  // Math utilities
  Math: harden(Math),
  // JSON for parsing
  JSON: harden(JSON),
  // Global values like null, undefined, true, false, NaN, Infinity
  // are automatically available in compartments - no need to set them
});

// Function to safely evaluate decoder expressions
function safeDecoderEval(expr: string) {
  return decoderCompartment.evaluate(expr);
}

// Function to safely evaluate input value expressions
function safeValueEval(expr: string) {
  return valueCompartment.evaluate(expr);
}

function evaluateExample(index: number) {
  const example = examples.value[index];
  if (!example.input.trim()) {
    example.result = undefined;
    example.syntaxError = undefined;
    return;
  }

  let inputValue: any;
  try {
    // Use valueCompartment for input expressions
    inputValue = safeValueEval(example.input);
    example.syntaxError = undefined;
  } catch (inputError: any) {
    let errorMessage = inputError.message;
    example.syntaxError = errorMessage;
    example.result = { error: '—' };
    return;
  }

  try {
    let decoder: any;

    try {
      // Use decoderCompartment for decoder expressions
      decoder = safeDecoderEval(currentDecoderName.value);
    } catch (decoderError) {
      decoder = (decodersModule as any)[currentDecoderName.value];

      if (!decoder) {
        example.result = { error: `Decoder '${currentDecoderName.value}' not found` };
        return;
      }
    }

    if (!decoder || typeof decoder.decode !== 'function') {
      example.result = { error: `'${currentDecoderName.value}' is not a valid decoder` };
      return;
    }

    const result = decoder.decode(inputValue);

    if (result.ok) {
      example.result = { success: true, value: result.value };
    } else {
      const errorMessage = extractErrorMessage(result.error);
      example.result = { error: errorMessage };
    }
  } catch (error: any) {
    example.result = { error: `Decoder error: ${error.message}` };
  }
}

function extractErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.text) return error.text;
  if (error?.message) return error.message;
  return 'Validation failed';
}

function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 0);
    } catch {
      return '[object Object]';
    }
  }
  return String(value);
}

function addExample() {
  examples.value.push({
    input: '',
    placeholder: 'Enter JavaScript expression...',
    result: undefined,
  });
}

function resetExamples() {
  console.log('resetExamples - props.defaultExamples:', props.defaultExamples);
  console.log(
    'resetExamples - props.defaultExamples length:',
    props.defaultExamples?.length,
  );
  const defaultInputs =
    props.defaultExamples && props.defaultExamples.length > 0
      ? props.defaultExamples
      : getDefaultExamplesForDecoder(currentDecoderName.value);
  console.log('resetExamples - defaultInputs:', defaultInputs);
  examples.value = defaultInputs.map((input) => ({
    input,
    placeholder: `Try: ${input}`,
    result: undefined,
  }));
  console.log('resetExamples - examples.value:', examples.value);

  nextTick(() => {
    examples.value.forEach((_, index) => evaluateExample(index));
  });
}

onMounted(() => {
  console.log('onMounted - currentDecoderName:', currentDecoderName.value);
  console.log('onMounted - props.decoderName:', props.decoderName);
  resetExamples();
  console.log('onMounted - examples after reset:', examples.value.length);
});

watch(
  () => props.decoderName,
  (newName) => {
    currentDecoderName.value = newName;
    // Only re-evaluate if we already have examples, otherwise let onMounted handle it
    if (examples.value.length > 0) {
      nextTick(() => {
        examples.value.forEach((_, index) => evaluateExample(index));
      });
    }
  },
);
</script>

<style scoped>
.decoder-playground {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
  margin: 1.5rem 0;
}

.decoder-header {
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider-light);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.decoder-label {
  font-weight: 600;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.decoder-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  font-weight: 600;
}

.decoder-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.playground-table {
  width: 100%;
  border-collapse: collapse;
  display: table !important;
}

.playground-table th {
  background: var(--vp-c-bg-soft);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider-light);
}

.playground-table td {
  padding: 0;
  border-bottom: 1px solid var(--vp-c-divider-light);
  vertical-align: top;
}

.input-cell {
  width: 40%;
  position: relative;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  resize: none;
  outline: none;
}

.input-field.syntax-error {
  background: var(--vp-custom-block-danger-bg);
  border-left: 4px solid var(--vp-custom-block-danger-border);
}

.syntax-error-message {
  padding: 0.5rem 0.75rem;
  background: var(--vp-custom-block-danger-bg);
  color: var(--vp-custom-block-danger-text);
  font-size: 0.8rem;
  border-left: 4px solid var(--vp-custom-block-danger-border);
}

.output-cell {
  width: 60%;
  /* background: var(--vp-c-bg-alt); */
  position: relative;
}

.loading,
.empty-result {
  padding: 0.75rem;
  color: var(--vp-c-text-2);
  font-style: italic;
  text-align: center;
}

.success-result,
.error-result {
  font-size: 0.875rem;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.error-badge {
  font-size: 0.7rem;
  padding: 0 6px;
  background-color: var(--vp-c-danger-2);
  border-radius: 6px;
}

.success-badge {
  font-size: 0.7rem;
  padding: 0 6px;
  background-color: darkgreen;
  border-radius: 6px;
}

.output-value {
  font-family: var(--vp-font-family-mono);
  word-break: break-all;
  flex: 1;
}

.error-message {
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  color: var(--vp-c-danger-1);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  flex: 1;
  line-height: 1.4;
}

.controls {
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider-light);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.control-button {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-button:hover {
  background: var(--vp-c-bg-alt);
}

.add-button {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
}

.add-button:hover {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
}
</style>
