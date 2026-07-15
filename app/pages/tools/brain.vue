<template>
  <!-- Wrapper Fixed Overlay (mencegah scroll bocor) -->
  <div class="fixed top-[64px] left-0 right-0 bottom-0 bg-white dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 flex flex-col font-sans overflow-hidden z-[45]">
    
    <!-- Login Screen -->
    <div v-if="!isUnlocked" class="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 absolute inset-0 z-50">
      <div class="w-full max-w-sm flex flex-col items-center px-6">
        <h1 class="text-sm font-semibold tracking-widest text-slate-400 mb-8 uppercase text-center">RESTRICTED VAULT</h1>
        <input 
          v-model="pinInput" 
          type="password" 
          placeholder="PIN" 
          class="w-full text-center text-xl tracking-[1em] bg-transparent border-b border-slate-300 dark:border-slate-700 py-4 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300 mb-8 font-mono transition-colors rounded-none"
          @keyup.enter="checkPin"
        />
        <p v-if="errorMsg" class="text-rose-500 text-xs font-medium">{{ errorMsg }}</p>
      </div>
    </div>

    <!-- 3-Column Layout Application (Responsive) -->
    <div v-else class="flex flex-col md:flex-row flex-1 w-full h-full overflow-hidden border-t border-slate-200 dark:border-slate-800 relative">
      
      <!-- MOBILE MENU REAR OVERLAY (To close by tapping outside) -->
      <div 
        v-if="isMobileMenuOpen" 
        @click="isMobileMenuOpen = false" 
        class="md:hidden absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-30"
      ></div>

      <!-- MOBILE TOP BAR (Only visible on mobile) -->
      <div class="md:hidden flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 z-20 shadow-sm shrink-0">
        <button @click="isMobileMenuOpen = true" class="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
          Menu
        </button>
        <span class="text-xs font-bold tracking-widest uppercase text-slate-400">Vault Brain</span>
      </div>

      <!-- LEFT SIDEBAR (Menu List) -->
      <div 
        :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
        class="absolute md:relative md:translate-x-0 left-0 inset-y-0 w-[80%] md:w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden z-40 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none"
      >
        <div class="p-6 pb-2 shrink-0 relative">
          <!-- Mobile Close Button inside sidebar -->
          <button @click="isMobileMenuOpen = false" class="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
          
          <h2 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest mb-6 uppercase">Workspace</h2>
          
          <div class="flex items-center gap-3 px-3 py-2 bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-md text-sm font-medium mb-1">
            <svg class="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Nodes Overview
          </div>
          
          <div class="mt-6 mb-4 relative">
            <svg class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              v-model="searchQuery" 
              @input="filterList"
              type="text" 
              placeholder="Search..." 
              class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-3 pb-4 space-y-1 custom-scrollbar">
          <button 
            v-for="node in filteredNodes" :key="node.id"
            @click="selectNodeFromList(node.id)"
            class="w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3"
            :class="selectedNode?.id === node.id 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'"
          >
            <div class="w-2 h-2 rounded-full shrink-0" :class="selectedNode?.id === node.id ? 'bg-white' : (node.group === 'unresolved' ? 'bg-amber-400' : 'bg-slate-400 dark:bg-slate-500')"></div>
            <span class="truncate font-medium">{{ node.label }}</span>
          </button>
        </div>
      </div>

      <!-- CENTER CANVAS (GRAPH) -->
      <div class="flex-1 w-full bg-white dark:bg-[#0b1120] relative z-10">
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <span class="text-xs tracking-widest text-slate-400 uppercase animate-pulse">Initializing Layout...</span>
        </div>
        
        <div class="absolute bottom-6 left-6 flex gap-2 z-20 pointer-events-auto">
          <button @click="recenterGraph" class="px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-md shadow-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Center Canvas
          </button>
        </div>

        <div id="graph-network" class="w-full h-full absolute inset-0"></div>
      </div>

      <!-- RIGHT SIDEBAR (DETAILS PANEL) -->
      <!-- Pada mobile, panel ini mengambang full menutupi layar; pada desktop menempel di samping -->
      <div 
        :class="selectedNode ? 'translate-x-0' : 'translate-x-full md:translate-x-full md:hidden'"
        class="absolute md:relative inset-y-0 right-0 w-full md:w-[28rem] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-full overflow-hidden transition-transform duration-300 z-50 md:z-10 shadow-2xl md:shadow-none"
      >
        <div v-if="selectedNode" class="h-full flex flex-col overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          <div class="flex items-center justify-between gap-2 mb-6 shrink-0">
            <div class="flex gap-2">
              <span class="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                {{ selectedNode.group === 'unresolved' ? 'DRAFT' : 'CONCEPT' }}
              </span>
              <span class="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded">
                NODE
              </span>
            </div>
            <!-- Huge Close Button for Mobile Accessibility -->
            <button @click="selectedNode = null" class="bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 hover:bg-rose-200 transition border border-rose-200 dark:border-rose-900/50 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider">TUTUP</button>
          </div>

          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8 tracking-tight shrink-0">
            {{ selectedNode.label }}
          </h2>

          <div v-if="selectedNode.content" class="flex-1 pb-16">
            <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest mb-4 uppercase">Content Context</h3>
            <div class="text-sm text-slate-600 dark:text-slate-300 leading-loose space-y-4 markdown-body w-full">
              <div v-html="renderMinimalMarkdown(selectedNode.content)"></div>
            </div>
          </div>
          
          <div v-else class="py-12 flex flex-col items-center justify-center text-center opacity-50 flex-1 pb-16">
            <svg class="w-8 h-8 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 12H4M12 20V4"/></svg>
            <p class="text-xs text-slate-500">Node exists theoretically, but physical markdown architecture is not yet formed.</p>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, shallowRef } from 'vue'

const isUnlocked = ref(false)
const pinInput = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const isMobileMenuOpen = ref(false) // Toggle untuk UI menu di mobile

const networkInstance = shallowRef(null)
const nodesDataSet = shallowRef(null)
const selectedNode = ref(null)

const fullData = ref({ nodes: [], edges: [] })
const searchQuery = ref('')
const filteredNodes = ref([])

useHead({
  title: 'Workspace | FikVault',
  script: [
    { src: 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js' }
  ],
  style: [
    { children: `
      /* Fix total untuk menyembunyikan footer FiGo dan mencegah scroll body di mobile */
      footer, .footer, [class*="footer"], #footer { display: none !important; }
      html, body { overflow: hidden !important; position: fixed; width: 100%; height: 100%; overscroll-behavior: none; }
      
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      
      .markdown-body h1, .markdown-body h2 { font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1.5rem; margin-bottom: 0.5rem; }
      .dark .markdown-body h1, .dark .markdown-body h2 { color: #94a3b8; }
      
      .markdown-body ul { margin-bottom: 1rem; }
      .markdown-body li { position: relative; padding-left: 1.25rem; margin-bottom: 0.4rem; list-style-type: none; }
      .markdown-body li::before { content: "0" counter(item); counter-increment: item; position: absolute; left: -0.5rem; font-size: 10px; color: #94a3b8; font-family: monospace; }
      .markdown-body ul { counter-reset: item; }
      
      .markdown-body p { margin-bottom: 1rem; word-break: break-word; }
      .markdown-body strong { font-weight: 600; color: #1e293b; }
      .dark .markdown-body strong { color: #f8fafc; }
    `}
  ]
})

const checkPin = async () => {
  errorMsg.value = ''
  if (!pinInput.value) return
  if (pinInput.value === '112233') {
    isUnlocked.value = true
    await loadGraphData()
  } else {
    errorMsg.value = 'CONNECTION REFUSED'
    pinInput.value = ''
  }
}

const filterList = () => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) {
    filteredNodes.value = fullData.value.nodes.sort((a,b) => a.label.localeCompare(b.label))
    return
  }
  filteredNodes.value = fullData.value.nodes.filter(n => n.label.toLowerCase().includes(q))
}

const selectNodeFromList = (id) => {
  if (!networkInstance.value) return
  networkInstance.value.selectNodes([id])
  networkInstance.value.focus(id, { scale: 1.3, animation: { duration: 400 } })
  loadNodeContent(id)
  isMobileMenuOpen.value = false // Auto close menu on mobile after selection
}

const loadGraphData = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`/api/brain?pin=${pinInput.value}`)
    if (!response.ok) throw new Error('API Sync Failed')
    const data = await response.json()
    fullData.value = data
    filterList()
    await nextTick() 
    renderGraph(data)
  } catch (err) {
    errorMsg.value = err.message
    isUnlocked.value = false 
  } finally {
    isLoading.value = false
  }
}

const recenterGraph = () => {
  if(networkInstance.value) {
    networkInstance.value.fit({ animation: { duration: 500 } })
    networkInstance.value.unselectAll()
    selectedNode.value = null
  }
}

const loadNodeContent = (nodeId) => {
  if (!fullData.value) return
  const nodeInfo = fullData.value.nodes.find(n => n.id === nodeId)
  if (nodeInfo) {
    selectedNode.value = nodeInfo
  }
}

const renderMinimalMarkdown = (text) => {
  if (!text) return ''
  
  let html = text.replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
  html = html.replace(/\[\[(.*?)\]\]/gm, `<span class="px-1 text-slate-800 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer rounded-sm transition">/$1</span>`)
  html = html.replace(/^### (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>')
  
  let segments = html.split('\n')
  let resultHtml = ''
  let inList = false
  
  for(let line of segments) {
    line = line.trim()
    if (!line) continue
    
    if (line.startsWith('<li>')) {
      if (!inList) { resultHtml += '<ul>'; inList = true; }
      resultHtml += line
    } else {
      if (inList) { resultHtml += '</ul>'; inList = false; }
      if (!line.startsWith('<h') && !line.startsWith('<ul>')) {
        resultHtml += '<p>' + line + '</p>'
      } else {
        resultHtml += line
      }
    }
  }
  if (inList) resultHtml += '</ul>'
  
  return resultHtml
}

const renderGraph = (data) => {
  if (typeof window === 'undefined' || !window.vis) return
  
  const container = document.getElementById('graph-network')
  if (!container) return
  
  let isDarkMode = false
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       isDarkMode = true
  }

  const nodeBg = isDarkMode ? '#1e293b' : '#ffffff' 
  const nodeBorder = isDarkMode ? '#475569' : '#e2e8f0' 
  const activeBg = '#2563eb' 
  const activeBorder = '#1d4ed8'
  const labelColor = isDarkMode ? '#94a3b8' : '#64748b' 
  const edgeColor = isDarkMode ? '#1e293b' : '#f1f5f9'

  nodesDataSet.value = new window.vis.DataSet(data.nodes.map(n => {
    return {
      id: n.id, label: n.label, shape: 'dot',
      size: n.group === 'unresolved' ? 4 : 8,
      color: {
        background: nodeBg, border: nodeBorder,
        highlight: { background: activeBg, border: activeBorder },
        hover: { background: isDarkMode ? '#334155' : '#f8fafc', border: activeBorder }
      },
      font: { color: labelColor, size: 12, face: 'ui-sans-serif, system-ui, sans-serif', vadjust: -6 },
      borderWidth: 1.5, borderWidthSelected: 3
    }
  }))
  
  const edgesDataSet = new window.vis.DataSet(data.edges.map(e => ({
    from: e.from, to: e.to,
    color: { color: edgeColor, highlight: activeBg, hover: activeBorder },
    arrows: { to: { enabled: false } }, 
    smooth: { type: 'continuous', roundness: 0.2 }, width: 1.5
  })))
  
  const options = {
    physics: {
      barnesHut: { gravitationalConstant: -2000, centralGravity: 0.1, springLength: 150, springConstant: 0.05, damping: 0.1 },
      stabilization: { iterations: 150 }
    },
    interaction: { hover: true, tooltipDelay: 200, zoomView: true, dragView: true }
  }
  
  networkInstance.value = new window.vis.Network(container, { nodes: nodesDataSet.value, edges: edgesDataSet }, options)
  
  // Tangkap deteksi tap di layar HP/Mobile
  networkInstance.value.on("click", (params) => {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0]
      loadNodeContent(nodeId)
      // Zoom pelan-pelan ke titik tengah
      networkInstance.value.focus(nodeId, { scale: 1.2, animation: { duration: 400 } })
    } else {
      selectedNode.value = null // Close sidebar on mobile
    }
  })
}
</script>
