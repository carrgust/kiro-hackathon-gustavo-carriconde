'use client';

import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';

interface ChartData {
  market_breakdown: Array<{ name: string; value: number; color: string }>;
  revenue_projections: Array<{ year: string; revenue: number; costs: number }>;
  financial_table: Array<{ metric: string; value: string }>;
}

const EMERALD_COLORS = ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'];

const chartAnimation = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#e5e7eb" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
      {name}: ${value}B
    </text>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/95 border border-emerald-500/30 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-emerald-400 font-semibold text-xs mb-1">{label || payload[0]?.name}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-white/90 text-xs">
          <span style={{ color: entry.color || entry.fill }}>●</span>{' '}
          {entry.name}: <span className="font-bold">${entry.value}{entry.dataKey === 'value' ? 'B' : 'M'}</span>
        </p>
      ))}
    </div>
  );
}

export default function BusinessPlanCharts({ chartData }: { chartData: ChartData }) {
  const revenueWithProfit = chartData.revenue_projections.map(r => ({
    ...r,
    profit: r.revenue - r.costs,
  }));

  return (
    <div className="space-y-6">
      {/* Charts Row: Pie + Bar side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Breakdown Pie Chart */}
        <motion.div {...chartAnimation} className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-emerald-400" size={20} />
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Market Breakdown</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.market_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={CustomPieLabel}
                  labelLine={{ stroke: '#6ee7b7', strokeWidth: 1 }}
                  animationBegin={200}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {chartData.market_breakdown.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color || EMERALD_COLORS[index % EMERALD_COLORS.length]}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend pills */}
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {chartData.market_breakdown.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || EMERALD_COLORS[i % EMERALD_COLORS.length] }} />
                <span className="text-xs text-white/80 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Revenue Projections Bar Chart */}
        <motion.div {...chartAnimation} transition={{ ...chartAnimation.transition, delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-emerald-400" size={20} />
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Revenue Projections</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueWithProfit} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" tick={{ fill: '#d1d5db', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#d1d5db', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} label={{ value: '$ Millions', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10 } }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#d1d5db' }} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} animationDuration={1000} animationBegin={400} />
                <Bar dataKey="costs" fill="#f59e0b" name="Costs" radius={[4, 4, 0, 0]} animationDuration={1000} animationBegin={600} />
                <Bar dataKey="profit" fill="#06b6d4" name="Profit" radius={[4, 4, 0, 0]} animationDuration={1000} animationBegin={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Tables Row: Financial Metrics + Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Metrics Table */}
        {chartData.financial_table && chartData.financial_table.length > 0 && (
          <motion.div {...chartAnimation} transition={{ ...chartAnimation.transition, delay: 0.4 }} className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-emerald-400" size={20} />
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Key Financial Metrics</h3>
            </div>
            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-700/40">
                    <th className="text-left text-xs font-bold text-emerald-300 uppercase tracking-wider px-4 py-2.5">Metric</th>
                    <th className="text-right text-xs font-bold text-emerald-300 uppercase tracking-wider px-4 py-2.5">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.financial_table.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className={`${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.05]'} border-b border-white/5 hover:bg-white/10 transition-colors`}
                    >
                      <td className="px-4 py-2.5 text-sm text-white/80">{row.metric}</td>
                      <td className="px-4 py-2.5 text-sm text-right font-bold text-emerald-400">{row.value}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Revenue Projections Table */}
        <motion.div {...chartAnimation} transition={{ ...chartAnimation.transition, delay: 0.6 }} className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-emerald-400" size={20} />
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Revenue Breakdown</h3>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-700/40">
                  <th className="text-left text-xs font-bold text-emerald-300 uppercase tracking-wider px-4 py-2.5">Period</th>
                  <th className="text-right text-xs font-bold text-emerald-300 uppercase tracking-wider px-4 py-2.5">Revenue</th>
                  <th className="text-right text-xs font-bold text-emerald-300 uppercase tracking-wider px-4 py-2.5">Costs</th>
                  <th className="text-right text-xs font-bold text-emerald-300 uppercase tracking-wider px-4 py-2.5">Profit</th>
                </tr>
              </thead>
              <tbody>
                {chartData.revenue_projections.map((row, i) => {
                  const profit = row.revenue - row.costs;
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.12 }}
                      className={`${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.05]'} border-b border-white/5 hover:bg-white/10 transition-colors`}
                    >
                      <td className="px-4 py-2.5 text-sm text-white/80 font-medium">{row.year}</td>
                      <td className="px-4 py-2.5 text-sm text-right font-bold text-emerald-400">${row.revenue}M</td>
                      <td className="px-4 py-2.5 text-sm text-right font-bold text-amber-400">${row.costs}M</td>
                      <td className={`px-4 py-2.5 text-sm text-right font-bold ${profit > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                        ${profit}M
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
