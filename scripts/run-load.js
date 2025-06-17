// scripts/run-load.js
import fetch from 'node-fetch'

if (process.argv.length < 5) {
  console.error('Usage: node run-load.js <SESSIONS> <ORDERS> <RESTOCK_INTERVAL>')
  process.exit(1)
}

const [ , , SESSIONS, ORDERS, RESTOCK_INTERVAL ] = process.argv.map(Number)
const API_BASE = process.env.LOAD_API_BASE || 'http://localhost:3000'

async function main() {
  console.log(`Starting load: ${SESSIONS} sessions × ${ORDERS} orders, restock every ${RESTOCK_INTERVAL}`)

  // 1) Kick off
  const genRes = await fetch(`${API_BASE}/api/generate-load?user=admin@cockroachlabs.com`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      numSessions: SESSIONS,
      numOrders: ORDERS,
      restockInterval: RESTOCK_INTERVAL,
    }),
  })
  if (!genRes.ok) {
    console.error('❌ Failed to start load:', await genRes.text())
    process.exit(2)
  }
  const { runId } = await genRes.json()
  console.log('✅ runId =', runId)

  // 2) Poll for summaries
  let done = false
  while (!done) {
    await new Promise((r) => setTimeout(r, 3000))
    const sumRes = await fetch(`${API_BASE}/api/load-summary?runId=${runId}`)
    if (!sumRes.ok) {
      console.error('❌ Summary fetch error:', await sumRes.text())
      continue
    }
    const rows = await sumRes.json()
    console.clear()
    console.log(`Run ${runId} — ${rows.length}/${SESSIONS} sessions completed`)
    console.table(
      rows.map((r) => ({
        user: r.username,
        orders: r.ordersCompleted,
        start: new Date(r.startTime).toLocaleTimeString(),
        end:   new Date(r.endTime).toLocaleTimeString(),
      }))
    )
    if (rows.length >= SESSIONS) done = true
  }

  console.log('🎉 All sessions done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(99)
})

