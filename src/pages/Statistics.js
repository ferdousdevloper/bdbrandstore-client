import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FaMoneyBillWave, FaUsers, FaBox, FaShoppingBag, FaArrowUp, FaChartBar } from 'react-icons/fa';
import SummaryApi from '../common/API';
import { motion } from 'framer-motion';

// আপনার থিমের মেইন কালার প্যালেট
const THEME_COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#f43f5e', '#f59e0b'];

// কাস্টম বার শেপ (Rounded Top)
const CustomBarShape = (props) => {
    const { fill, x, y, width, height } = props;
    if (height <= 0) return null;
    return (
        <path
            d={`M${x},${y + height} L${x},${y + 12} Q${x},${y} ${x + 12},${y} L${x + width - 12},${y} Q${x + width},${y} ${x + width},${y + 12} L${x + width},${y + height} Z`}
            stroke="none"
            fill={fill}
        />
    );
};

const Statistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await fetch(SummaryApi.getStatistics.url, {
                method: SummaryApi.getStatistics.method,
                headers: {
                    "content-type": "application/json",
                    "authorization": localStorage.getItem('token') 
                },
                credentials: "include" 
            });
            const dataResponse = await response.json();
            if (dataResponse.success) {
                setStats(dataResponse.data);
            }
        } catch (error) {
            console.error("API Call Failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 lg:p-10 space-y-10 bg-surface-50 min-h-screen font-sans">
            
            {/* --- Header Section --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h2>
                    <p className="text-slate-500 text-xs md:text-sm font-medium">Business intelligence powered by your primary theme</p>
                </div>
                <div className="flex items-center self-start sm:self-center gap-3 bg-white px-4 py-2 rounded-2xl border border-surface-200 shadow-soft">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live System</span>
                </div>
            </div>

            {/* --- Top Stat Cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard title="Total Revenue" value={`৳${stats?.counts.revenue?.toLocaleString()}`} icon={<FaMoneyBillWave/>} color="from-primary-600 to-primary-400" trend="+12.5%" />
                <StatCard title="Total Orders" value={stats?.counts.orders} icon={<FaShoppingBag/>} color="from-slate-800 to-slate-600" trend="+8.2%" />
                <StatCard title="Total Products" value={stats?.counts.products} icon={<FaBox/>} color="from-primary-700 to-primary-500" trend="+3.1%" />
                <StatCard title="Total Customers" value={stats?.counts.users} icon={<FaUsers/>} color="from-accent-coral to-red-400" trend="+5.9%" />
            </div>

            {/* --- Charts Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Revenue Bar Chart (Using Primary Gradient) */}
                <div className="lg:col-span-2 bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-cardHover relative overflow-hidden border border-primary-700/30">
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-500/10 blur-[100px] rounded-full"></div>
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-primary-300">
                                <FaChartBar size={24}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl tracking-tight">Revenue Breakdown</h3>
                                <p className="text-primary-200/50 text-[10px] font-bold uppercase tracking-[0.2em]">Data Insights</p>
                            </div>
                        </div>
                    </div>

                    {/* Chart Container - Margins fixed for responsiveness */}
                    <div className="h-[300px] md:h-[400px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 11, fontWeight: 600, fill: 'rgba(255,255,255,0.4)'}} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 11, fontWeight: 600, fill: 'rgba(255,255,255,0.4)'}} 
                                />
                                <Tooltip 
                                    content={<CustomTooltip />} 
                                    cursor={{fill: 'rgba(255,255,255,0.05)', radius: 15}} 
                                />
                                <Bar 
                                    dataKey="sales" 
                                    shape={<CustomBarShape />}
                                    fill="#2dd4bf" 
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart Card (Surface & White) */}
                <div className="bg-white p-8 rounded-[2.5rem] md:rounded-[3.5rem] border border-surface-200 shadow-soft flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-8 px-2">
                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">Inventory Distribution</h3>
                        <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                    </div>
                    
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={stats?.categoryData} 
                                    innerRadius="60%" 
                                    outerRadius="80%" 
                                    paddingAngle={10} 
                                    dataKey="value"
                                >
                                    {stats?.categoryData?.map((_, index) => (
                                        <Cell key={index} fill={THEME_COLORS[index % THEME_COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', fontWeight: 'bold'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-xl text-white p-5 rounded-2xl shadow-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-2">{label}</p>
                <p className="text-xl font-black tracking-tight">৳{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

const StatCard = ({ title, value, icon, color, trend }) => (
    <motion.div 
        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        className="bg-white p-7 rounded-3xl border border-surface-200 shadow-card hover:border-primary-100 transition-all relative overflow-hidden group"
    >
        <div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className={`w-14 h-14 bg-gradient-to-br ${color} text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                {icon}
            </div>
            <div className="bg-primary-50 text-primary-700 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-primary-100">
                <FaArrowUp className="inline mr-1" size={8}/> {trend}
            </div>
        </div>
        <div className="relative z-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h4>
        </div>
    </motion.div>
);

export default Statistics;