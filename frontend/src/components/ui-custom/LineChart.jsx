import { useMemo } from "react";
import {LineChart as RechartsLineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Area,} from "recharts";

const LineChart = ({
  data,
  title,
  subtitle,
  height = 300,
  showGrid = true,
  gradientColor = "#0FCE7C",
  lineColor = "#0FCE7C",
  areaColor = "#0FCE7C",
}) => {
  const minValue = useMemo(() => Math.min(...data.map((item) => item.value)) * 0.9, [data]);
  const maxValue = useMemo(() => Math.max(...data.map((item) => item.value)) * 1.1, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-kerelance-dark-card border border-white/10 p-2 rounded shadow-lg">
          <p className="text-gray-300 text-xs">{`${label}`}</p>
          <p className="text-kerelance-primary font-medium">
            {`₹${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-4 rounded-lg w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-medium text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      )}

      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
            )}

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8F9BB3", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              domain={[minValue, maxValue]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8F9BB3", fontSize: 12 }}
              width={40}
              tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              fill="url(#colorValue)"
              fillOpacity={1}
              activeDot={{ r: 6, fill: areaColor, stroke: "white", strokeWidth: 2 }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: lineColor, stroke: "white", strokeWidth: 2 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;
