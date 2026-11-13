<script setup>
import { ref, onMounted } from 'vue'

const message = ref('Loading...')
const podName = ref('')
const users = ref([])
const error = ref('')

async function loadData() {
  error.value = ''
  try {
    // Fetch welcome message
    const res = await fetch('/api/welcome')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    message.value = data.message
    podName.value = data.pod

    // Fetch users from PostgreSQL
    const userRes = await fetch('/api/users')
    if (userRes.ok) {
      users.value = await userRes.json()
    } else {
      console.error('Failed to fetch users:', userRes.status)
    }
  } catch (e) {
    error.value = e.message
    message.value = 'Failed to reach backend'
  }
}

onMounted(loadData)
</script>

<template>
  <div class="container">
    <h1>🔥 AUTOMATED DEPLOYMENT IS LIVE! 🔥</h1>

    <div v-if="error" class="card error">
      <p>❌ {{ message }}</p>
      <p class="small">{{ error }}</p>
    </div>

    <div v-else class="card">
      <p class="label">Backend says:</p>
      <p class="message">{{ message }}</p>
      <p v-if="podName" class="label">
        Served by pod: <code>{{ podName }}</code>
      </p>
    </div>

    <!-- NEW: Users Table -->
    <div class="card">
      <h2>Database Users</h2>
      <table v-if="users.length > 0" class="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.username">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.username }}</td>
            <td>
              <span :class="user.isActive ? 'badge-active' : 'badge-inactive'">
                {{ user.isActive ? 'Yes' : 'No' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>No users found (or database is empty).</p>
    </div>

    <button @click="loadData" class="refresh">🔄 Refresh</button>
  </div>
</template>

<style scoped>
.container {
  max-width: 700px;
  margin: 60px auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 30px;
  color: #1a1a1a;
}

h2 {
  font-size: 1.4rem;
  margin-bottom: 15px;
  color: #1a1a1a;
}

.card {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 30px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card.error {
  background: #ffe6e6;
  border-color: #ff9999;
}

.label {
  font-size: 0.85rem;
  color: #666;
  margin: 8px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.message {
  font-size: 1.4rem;
  font-weight: 600;
  color: #42b983;
  margin: 10px 0;
}

.small {
  font-size: 0.8rem;
  color: #999;
}

code {
  background: #e8e8e8;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #d63384;
}

.refresh {
  background: #42b983;
  color: white;
  border: none;
  padding: 12px 32px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
}

.refresh:hover {
  background: #369870;
}

/* Table Styles */
.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.user-table th,
.user-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.user-table th {
  background: #42b983;
  color: white;
  font-weight: 600;
}

.user-table tr:hover {
  background: #f0fdf4;
}

.badge-active {
  background: #dcfce7;
  color: #166534;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-inactive {
  background: #fee2e2;
  color: #991b1b;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>