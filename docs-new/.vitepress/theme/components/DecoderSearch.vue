<template>
  <div class="decoder-search">
    <div class="search-shortcut">Press <kbd>⌘</kbd> <kbd>K</kbd> to search decoders</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

// Enhanced search functionality will be added here
// For now, this leverages VitePress's built-in search with custom styling

onMounted(() => {
  // Add custom keyboard shortcut handling if needed
  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      // Trigger VitePress search modal
      const searchButton = document.querySelector('.DocSearch-Button') as HTMLElement;
      if (searchButton) {
        searchButton.click();
      }
    }
  };

  document.addEventListener('keydown', handleKeydown);

  return () => {
    document.removeEventListener('keydown', handleKeydown);
  };
});

onUnmounted(() => {
  // Cleanup handled by onMounted return function
});
</script>

<style scoped>
.decoder-search {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.search-shortcut {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

kbd {
  background: var(--vp-c-mute);
  border: 1px solid var(--vp-c-divider);
  border-radius: 3px;
  padding: 0.125rem 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  color: var(--vp-c-text-1);
}
</style>
