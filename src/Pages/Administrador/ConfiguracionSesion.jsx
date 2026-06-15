import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase_config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { GoHomeFill } from 'react-icons/go';
import { IoArrowBackCircle } from 'react-icons/io5';
import { FaArrowRight } from 'react-icons/fa';

const PRESETS = [
    { label: '10 segundos', value: 10 * 1000 },
    { label: '30 minutos',  value: 30 * 60 * 1000 },
    { label: '1 hora',      value: 1 * 60 * 60 * 1000 },
    { label: '2 horas',     value: 2 * 60 * 60 * 1000 },
    { label: '3 horas',     value: 3 * 60 * 60 * 1000 },
    { label: '4 horas',     value: 4 * 60 * 60 * 1000 },
    { label: '5 horas',     value: 5 * 60 * 60 * 1000 },
    { label: '6 horas',     value: 6 * 60 * 60 * 1000 },
    { label: '7 horas',     value: 7 * 60 * 60 * 1000 },
    { label: '8 horas',     value: 8 * 60 * 60 * 1000 },
];

const formatMs = (ms) => {
    if (ms < 60 * 1000) return `${ms / 1000} segundos`;
    if (ms < 60 * 60 * 1000) return `${ms / (60 * 1000)} minutos`;
    const h = ms / (60 * 60 * 1000);
    return h === 1 ? '1 hora' : `${h} horas`;
};

function ConfiguracionSesion() {
    const navigate = useNavigate();
    const [currentMs, setCurrentMs] = useState(4 * 60 * 60 * 1000);
    const [selectedMs, setSelectedMs] = useState(4 * 60 * 60 * 1000);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const load = async () => {
            const snap = await getDoc(doc(db, 'config', 'sesion'));
            if (snap.exists() && snap.data()?.duracionMs) {
                const val = Number(snap.data().duracionMs);
                setCurrentMs(val);
                setSelectedMs(val);
            }
        };
        load().catch(console.error);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'config', 'sesion'), { duracionMs: selectedMs });
            setCurrentMs(selectedMs);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error guardando configuración de sesión:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="px-4 py-5 lg:px-6">
                <main className="mx-auto w-full max-w-[1200px] min-w-0 text-sm text-gray-600">
                    <section className="mb-6 rounded-lg border border-slate-200 bg-white">
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-2">
                                <Link to="/" className="hidden items-center gap-2 font-medium text-slate-600 transition hover:text-slate-800 md:flex">
                                    <GoHomeFill style={{ width: 16, height: 16 }} />
                                    <span>Home</span>
                                </Link>
                                <FaArrowRight className="hidden text-slate-400 md:block" style={{ width: 10, height: 10 }} />
                                <Link to="/admin" className="hidden font-medium text-slate-600 transition hover:text-slate-800 md:block">
                                    Administración
                                </Link>
                                <FaArrowRight className="hidden text-slate-400 md:block" style={{ width: 10, height: 10 }} />
                                <h1 className="text-sm font-semibold tracking-tight text-slate-900">Cierre de sesión</h1>
                            </div>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 self-start rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:self-auto"
                                onClick={() => navigate('/admin')}
                            >
                                <IoArrowBackCircle className="text-lg" />
                                <span>Regresar</span>
                            </button>
                        </div>

                        <div className="px-5 py-5 space-y-5">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-sm text-slate-600">
                                    Duración actual:{' '}
                                    <span className="font-semibold text-slate-900">{formatMs(currentMs)}</span>
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Los cambios se aplican a las nuevas sesiones. Las sesiones activas mantienen su tiempo original.
                                </p>
                            </div>

                            <div>
                                <p className="mb-3 text-sm font-medium text-slate-700">Selecciona la duración</p>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                                    {PRESETS.map((preset) => (
                                        <button
                                            key={preset.value}
                                            type="button"
                                            onClick={() => setSelectedMs(preset.value)}
                                            className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                                                selectedMs === preset.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving || selectedMs === currentMs}
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                                {saved && (
                                    <span className="text-sm font-medium text-green-600">Guardado correctamente</span>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default ConfiguracionSesion;
