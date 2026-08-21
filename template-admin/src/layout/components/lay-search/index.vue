<script setup lang="ts">
import { Search as SearchIcon } from '@element-plus/icons-vue'
import { useBoolean } from '../../hooks/useBoolean'
import SearchModal from './components/SearchModal.vue'

const { bool: show, toggle } = useBoolean()
function handleSearch() {
  toggle()
}
</script>

<template>
  <div>
    <div class="search-container w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover" @click="handleSearch">
      <PureIcon :icon="SearchIcon" :size="18" />
    </div>
    <SearchModal v-model:value="show" />
  </div>
</template>
