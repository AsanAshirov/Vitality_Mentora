import React from 'react'
import { I } from '../Icons'

interface Props {
  open: boolean
  onClose: () => void
}

export default function WeekBriefModal({ open, onClose }: Props) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">Бриф · Неделя 2 из 6</span>
          <button className="btn ghost" onClick={onClose}><I.X /></button>
        </div>
        <div className="modal-body">
          <p className="mute" style={{fontSize: 13, marginBottom: 8}}>Поток Q2-26 · 19–23 мая 2026</p>
          <h3 style={{marginBottom: 16}}>Тема недели: Верификация клиентов (KYC)</h3>
          <div className="crm-card" style={{marginBottom: 12}}>
            <div className="crm-row"><span className="crm-label">Цель</span><span className="crm-val">Научиться проводить полный цикл KYC-верификации: от поиска клиента до санкционного скрининга и оценки риска.</span></div>
            <div className="crm-row"><span className="crm-label">Задачи</span><span className="crm-val">T-2148 · T-2150 · T-2155</span></div>
            <div className="crm-row"><span className="crm-label">Материалы</span><span className="crm-val">KYC-PROC v3.4 · SANCTIONS-PROC v1.7</span></div>
            <div className="crm-row"><span className="crm-label">Дедлайн</span><span className="crm-val">Пятница, 23 мая 2026</span></div>
          </div>
          <p style={{fontSize: 13, lineHeight: 1.6}}>
            На этой неделе ты отрабатываешь навык первичной верификации клиентов. Главная ловушка — санкционный скрининг: при уверенности хита &gt;50% обязательна эскалация. Изучи KYC-PROC §2.1 и SANCTIONS-PROC §1–3 до начала практики.
          </p>
          <div className="hint-card" style={{marginTop: 12}}>
            <strong>Подсказка наставника:</strong> Начни с тренировочного задания T-2148, потом переходи к реальному T-2150.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Понятно, начнём</button>
        </div>
      </div>
    </div>
  )
}
