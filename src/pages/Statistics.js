import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, 
  PolarAngleAxis, Radar 
} from 'recharts';
import { 
  FaMoneyBillWave, FaUsers, FaBox, FaShoppingBag, FaChartBar, 
  FaExclamationTriangle, FaTruckLoading, FaWarehouse, FaChartPie, FaCubes, FaGlobe
} from 'react-icons/fa';
import SummaryApi from '../common/API';
import { motion } from 'framer-motion';

// আপনার থিম কালার প্যালেট (Tailwind Config অনুযায়ী)
const THEME_COLORS = ['#14b8a6', '#0f766e', '#134e4a', '#f43f5e', '#f59e0b'];

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

    const orderStatusData = [
        { subject: 'Delivered', A: 120 },
        { subject: 'Pending', A: 98 },
        { subject: 'Canceled', A: 40 },
        { subject: 'Shipped', A: 85 },
        { subject: 'Confirmed', A: 110 },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface-50">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-primary-800 font-bold text-[10px] uppercase tracking-[0.3em]">Loading Engine</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 lg:p-10 space-y-10 bg-surface-50 min-h-screen font-sans">
            
            {/* Header Section */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary-900 tracking-tighter uppercase">
                        Core <span className="text-primary-500 font-normal">Intelligence</span>
                    </h2>
                    <p className="text-surface-300 text-sm font-semibold flex items-center gap-2 mt-1">
                       <FaGlobe className="text-primary-400"/> Monitoring global store activity and stock flow.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-soft border border-surface-100">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                    <span className="text-xs font-black text-primary-900 uppercase tracking-widest">Live System</span>
                </div>
            </div>

            {/* Stat Cards - Gradient Styled */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                <StatCard title="Total Revenue" value={`৳${stats?.counts.revenue?.toLocaleString()}`} icon={<FaMoneyBillWave/>} gradient="from-primary-900 to-primary-700" />
                <StatCard title="Total Orders" value={stats?.counts.orders} icon={<FaShoppingBag/>} gradient="from-primary-700 to-primary-500" />
                <StatCard title="Store Products" value={stats?.counts.products} icon={<FaBox/>} gradient="from-primary-600 to-primary-400" />
                <StatCard title="Critical Stock" value="14" icon={<FaExclamationTriangle/>} gradient="from-accent-coral to-rose-700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                
                {/* 1. Revenue Velocity - Deep Gradient Bar Chart */}
                <div className="lg:col-span-2 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-primary-800">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 blur-[100px] rounded-full"></div>
                    <div className="mb-10 relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-2xl text-primary-300">
                                <FaChartBar size={24}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl">Revenue Velocity</h3>
                                <p className="text-primary-300/60 text-xs">Dynamic performance analytics</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.salesData}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 700}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 700}} />
                                <Tooltip content={<CustomTooltipDark />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                                <Bar dataKey="sales" fill="#5eead4" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* 4. Stock Balance - Gradient Donut */}
                <div className="bg-gradient-to-br from-primary-500 to-primary-200 p-8 rounded-[2.5rem] shadow-soft border border-white flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white/10  rounded-2xl text-primary-900 shadow-card">
                            <FaWarehouse size={22}/>
                        </div>
                        <h3 className="font-bold text-primary-900 text-lg tracking-tight">Stock Balance</h3>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats?.categoryData} innerRadius={75} outerRadius={95} paddingAngle={10} dataKey="value" stroke="none">
                                    {stats?.categoryData?.map((_, index) => (
                                        <Cell key={index} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '11px', fontWeight: '900', color: '#134e4a'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Logistics Audit - Primary Light Theme */}
                <div className="bg-gradient-to-br from-primary-500 via-primary-900 to-primary-900 p-8 rounded-[2.5rem] shadow-soft border border-surface-100 flex flex-col items-center">
                    <div className="self-start flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white/10 rounded-2xl text-primary-200">
                            <FaTruckLoading size={22}/>
                        </div>
                        <h3 className="font-bold text-white text-lg tracking-tight">Logistics Audit</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={orderStatusData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                                <Radar name="Orders" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Revenue by Category - Gradient Bar Section */}
                <div className="lg:col-span-2 bg-gradient-to-br from-primary-500 via-primary-900 to-primary-900 p-8 rounded-[2.5rem] shadow-soft border border-surface-100 relative overflow-hidden">
                    <div className="mb-10 flex items-center gap-4">
                        <div className="p-3 bg-white-10 rounded-2xl text-primary-100 shadow-lg">
                            <FaCubes size={22}/>
                        </div>
                        <div>
                            <h3 className="font-black text-primary-900 text-xl tracking-tight">Category Distribution</h3>
                            <p className="text-surface-300 text-xs font-bold uppercase tracking-widest">Market segment analysis</p>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={stats?.categoryData} margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#99f6e4', fontSize: 12, fontWeight: '900'}} />
                                <Tooltip cursor={{fill: '#134e4a'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="value" fill="#99f6e4" radius={[0, 12, 12, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                

            </div>
        </div>
    );
};

// Tooltip Component
const CustomTooltipDark = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-primary-900 border border-white/10 p-4 rounded-2xl shadow-2xl">
                <p className="text-[10px] font-black text-primary-300 uppercase mb-1 tracking-widest">{label}</p>
                <p className="text-xl font-black text-white">৳{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

// StatCard Component
const StatCard = ({ title, value, icon, gradient }) => (
    <motion.div 
        whileHover={{ y: -8, scale: 1.02 }} 
        className={`bg-gradient-to-br ${gradient} p-7 rounded-[2.2rem] shadow-xl relative overflow-hidden group`}
    >
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="flex justify-between items-center mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center text-2xl border border-white/20 shadow-inner">
                {icon}
            </div>
        </div>
        <p className="text-[11px] font-bold text-white/70 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h4 className="text-3xl font-black text-white tracking-tighter">{value}</h4>
    </motion.div>
);

export default Statistics;