import { useState } from 'react';
import ExportButton from '../components/ExportButton';

// ─── Nav Sections ─────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',  label: 'Overview',              icon: '🏠' },
  { id: 'module1',   label: 'M1: Regulatory',        icon: '⚖️' },
  { id: 'module2',   label: 'M2: KYC / CDD / EDD',  icon: '🔍' },
  { id: 'module3',   label: 'M3: Name Screening',    icon: '🔎' },
  { id: 'module4',   label: 'M4: Transaction Mon.',  icon: '📊' },
  { id: 'module5',   label: 'M5: STR Filing',        icon: '📋' },
  { id: 'quiz',      label: 'Assessment',            icon: '✏️' },
];

// ─── Knowledge Check Component ────────────────────────────────────────────────
const KC_FEEDBACK = {
  kc1: { correct: 'FATF Recommendation 20 specifically requires reporting entities to file suspicious transaction reports with their financial intelligence unit.', wrong: 'Review FATF Recommendations — R20 is specifically about suspicious transaction reporting obligations.' },
  kc2: { correct: 'A PEP requires Enhanced Due Diligence (EDD) including senior management approval before the relationship can be established or continued.', wrong: 'PEPs always require EDD under RBI KYC norms. Review Module 2 on EDD triggers.' },
  kc3: { correct: 'A DOB mismatch is a significant indicator but not conclusive by itself. All parameters must be compared. If uncertain, escalation to L2 is appropriate.', wrong: 'DOB mismatch alone is not sufficient to automatically close as FP. All parameters must be compared.' },
  kc4: { correct: 'When an L1 analyst cannot reach a definitive conclusion, the SOP requires escalation to L2 with appropriate investigation comments recorded in STAR.', wrong: 'Closing as non-suspicious without basis or contacting the merchant (tipping off risk) are both incorrect.' },
  kc5: { correct: 'The STR workflow requires PO approval in the Centra module of Jocata before the STR is uploaded to Fingate 2.0.', wrong: 'Review the STR filing process. PO approval in Centra is the mandatory step before filing with FIU-IND.' },
};

function KnowledgeCheck({ id, question, options, correctIdx }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const isCorrect = selected === correctIdx;

  return (
    <div style={{
      background: '#0d1b2a', borderRadius: 12, padding: '20px 24px',
      margin: '20px 0', color: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, background: '#c8963a', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: '#0d1b2a', fontWeight: 700, flexShrink: 0,
        }}>✓</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#e8b96a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Knowledge Check
        </span>
      </div>
      <div style={{ fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>{question}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, i) => {
          let bg = 'rgba(255,255,255,0.07)';
          let border = '1px solid rgba(255,255,255,0.12)';
          let color = 'rgba(255,255,255,0.85)';
          if (selected !== null) {
            if (i === correctIdx) { bg = 'rgba(29,158,117,0.25)'; border = '1px solid #1d9e75'; color = '#9fe1cb'; }
            else if (i === selected) { bg = 'rgba(192,57,43,0.25)'; border = '1px solid #e74c3c'; color = '#f7c1c1'; }
          }
          return (
            <div key={i}
              onClick={() => handleSelect(i)}
              style={{
                background: bg, border, borderRadius: 8, padding: '10px 14px',
                cursor: selected === null ? 'pointer' : 'default',
                fontSize: 13, color, display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>{String.fromCharCode(65 + i)}</span>
              {opt}
            </div>
          );
        })}
      </div>
      {selected !== null && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 12,
          background: isCorrect ? 'rgba(29,158,117,0.2)' : 'rgba(192,57,43,0.2)',
          color: isCorrect ? '#9fe1cb' : '#f7c1c1',
          border: `1px solid ${isCorrect ? 'rgba(29,158,117,0.4)' : 'rgba(192,57,43,0.4)'}`,
        }}>
          {isCorrect ? '✓ Correct! ' : '✗ Not quite. '}
          {KC_FEEDBACK[id]?.[isCorrect ? 'correct' : 'wrong']}
        </div>
      )}
    </div>
  );
}

// ─── Styled Table Component ───────────────────────────────────────────────────
function TTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', margin: '14px 0', borderRadius: 8, border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                background: '#0d1b2a', color: 'white', padding: '9px 13px',
                textAlign: 'left', fontSize: 11, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '9px 13px', borderBottom: '1px solid var(--border)',
                  color: 'var(--text2)', verticalAlign: 'top', fontSize: 12,
                  background: i % 2 === 1 ? '#f8fafc' : '#fff',
                }}
                  dangerouslySetInnerHTML={{ __html: cell }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Info Box Component ───────────────────────────────────────────────────────
function InfoBox({ type = 'blue', title, children }) {
  const colors = {
    blue:  { bg: '#ebf4ff', border: '#3182ce', text: '#1a365d' },
    gold:  { bg: '#fdf3e1', border: '#c8963a', text: '#4a2c0a' },
    green: { bg: '#e1f5ee', border: '#1d9e75', text: '#1a4a38' },
    red:   { bg: '#fdecea', border: '#c0392b', text: '#4a1010' },
  };
  const c = colors[type];
  return (
    <div style={{
      background: c.bg, borderLeft: `3px solid ${c.border}`,
      borderRadius: 10, padding: '14px 18px', margin: '14px 0',
      fontSize: 13, color: c.text, lineHeight: 1.7,
    }}>
      {title && <strong style={{ display: 'block', marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>{title}</strong>}
      {children}
    </div>
  );
}

// ─── Process Flow Component ───────────────────────────────────────────────────
function ProcessFlow({ steps }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, margin: '14px 0' }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          flex: 1, minWidth: 120, background: '#fff',
          border: '1px solid var(--border)', padding: '14px 12px',
          position: 'relative', textAlign: 'center',
        }}>
          {i < steps.length - 1 && (
            <span style={{
              position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)',
              color: '#c8963a', fontSize: 18, fontWeight: 700, zIndex: 1,
              background: '#fff', padding: '0 2px',
            }}>→</span>
          )}
          <div style={{
            width: 28, height: 28, background: '#0d1b2a', color: '#fff',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 12, fontWeight: 700, margin: '0 auto 8px',
          }}>{s.num}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0d1b2a' }}>{s.label}</div>
          {s.sub && <div style={{ fontSize: 10, color: '#8896ab', marginTop: 3 }}>{s.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── QUIZ DATA ────────────────────────────────────────────────────────────────
const ALL_QUESTIONS = [
  { id: 1, set: 1, text: 'Under PMLA 2002, what is the maximum timeframe within which an STR must be filed with FIU-IND after suspicion is formed?', options: ['24 hours', '3 days', '7 days', '30 days'], correct: 2, explanation: 'PMLA 2002 requires STRs to be filed within 7 days of forming suspicion. This is a hard regulatory deadline.' },
  { id: 2, set: 1, text: 'What does the FATF Risk-Based Approach (RBA) primarily require?', options: ['Apply identical controls to all customers', 'Allocate AML resources proportionate to ML/TF risk', 'File an STR for every transaction above ₹10 lakh', 'Outsource compliance to a third party'], correct: 1, explanation: 'The FATF RBA requires that AML/CFT measures be proportionate to identified risks.' },
  { id: 3, set: 2, text: 'Which tool is used for NAME SCREENING and which for TRANSACTION MONITORING at PPSL?', options: ['STAR for screening; RAMP for monitoring', 'RAMP for screening; STAR for monitoring', 'Both tools do both equally', 'Fingate 2.0 handles both'], correct: 1, explanation: 'RAMP is the name screening tool. STAR is the transaction monitoring tool. Both are within Jocata.' },
  { id: 4, set: 2, text: 'Which of the following describes a PEP as defined by RBI Master Direction on KYC?', options: ['Business owner with turnover exceeding ₹1 crore', 'Individual entrusted with prominent public function in a foreign country', 'Any individual previously investigated by law enforcement', 'Merchant operating in gambling category'], correct: 1, explanation: 'RBI defines PEPs as individuals entrusted with prominent public functions in a foreign country.' },
  { id: 5, set: 3, text: 'What is the purpose of the Centra functionality within Jocata?', options: ['Generating management reports', 'Bulk screening capability', 'PO approves STRs before FIU-IND filing', 'Managing access rights'], correct: 2, explanation: 'Centra is the Jocata module used for the Principal Officer to approve STRs before Fingate 2.0 upload.' },
  { id: 6, set: 3, text: 'What is "Tipping Off" in AML compliance?', options: ['Providing a tip to AML team', 'Disclosing to any person that ML/TF investigation is being conducted', 'Reporting to FIU-IND before internal review', 'Alerting PO about potential STR'], correct: 1, explanation: 'Tipping off under PMLA is disclosing to the subject that an ML/TF investigation is ongoing. This is a criminal offence.' },
  { id: 7, set: 4, text: 'Who performs Quality Check on alerts closed as non-suspicious by L1 analysts?', options: ['Principal Officer', 'L3 Analyst', 'L2 Analyst', 'AML Tech Ops'], correct: 2, explanation: 'Under the PPSL QC programme, L2 analysts review and quality-check alerts closed by L1 analysts.' },
  { id: 8, set: 4, text: 'What is the minimum record retention period for AML/KYC records under PMLA Rules?', options: ['1 year', '3 years', '5 years', '10 years'], correct: 2, explanation: 'PML Rules 2005 require KYC records to be retained for minimum 5 years from end of business relationship.' },
  { id: 9, set: 5, text: 'Which sanction lists are PPSL obligated to screen against due to REGULATORY requirements?', options: ['OFAC SDN and HMT Consolidated', 'UNSC Consolidated Lists and MHA designations under UAPA', 'EU Sanctions and OFAC SDN', 'All international sanctions lists'], correct: 1, explanation: 'Regulatory obligations under RBI/UAPA require screening against UNSC lists and MHA designations.' },
  { id: 10, set: 5, text: 'After an STR is prepared by L3, which step must occur BEFORE it is uploaded to Fingate 2.0?', options: ['Merchant must be notified', 'L1 analyst must re-review it', 'Principal Officer must approve in Centra module', 'External legal counsel must review'], correct: 2, explanation: 'PO approval in Centra is mandatory before filing with FIU-IND via Fingate 2.0.' },
];

// ─── Quiz Component ───────────────────────────────────────────────────────────
function QuizSection() {
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const q = ALL_QUESTIONS[currentQ];
  const answered = answers[currentQ] !== undefined;
  const isCorrect = answers[currentQ] === q?.correct;

  const handleSelect = (idx) => {
    if (answers[currentQ] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentQ]: idx }));
  };

  const allAnswered = Object.keys(answers).length === ALL_QUESTIONS.length;
  const score = ALL_QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
  const pct = Math.round((score / ALL_QUESTIONS.length) * 100);
  const passed = pct >= 80;

  if (submitted) {
    return (
      <div>
        <div style={{
          background: passed ? '#0d1b2a' : '#1a0a0a',
          borderRadius: 14, padding: '32px', textAlign: 'center', marginBottom: 20,
        }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%', margin: '0 auto 16px',
            background: passed ? '#1d9e75' : '#c0392b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#fff',
          }}>{pct}%</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: passed ? '#e8b96a' : '#f7c1c1', marginBottom: 8 }}>
            {passed ? 'Assessment Passed ✓' : 'Assessment Not Cleared'}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
            {passed
              ? 'Congratulations! You have successfully completed the AML Compliance Training.'
              : `Your score of ${pct}% is below the required 80% pass mark. Please review the modules and retake.`}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28 }}>
            {[{ val: score, lbl: 'Correct', color: '#1d9e75' }, { val: ALL_QUESTIONS.length - score, lbl: 'Incorrect', color: '#e57373' }, { val: `${pct}/100`, lbl: 'Score', color: '#e8b96a' }].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Review */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>Question Review</div>
          {ALL_QUESTIONS.map((q, idx) => {
            const correct = answers[idx] === q.correct;
            return (
              <div key={idx} style={{
                padding: 14, borderRadius: 10, marginBottom: 10,
                background: correct ? '#e6f4f0' : '#fff0ee',
                border: `1px solid ${correct ? '#9fe1cb' : '#f5c4b3'}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: correct ? '#1d9e75' : '#c0392b', marginBottom: 5 }}>
                  {correct ? '✓ CORRECT' : '✗ INCORRECT'} — Q{idx + 1}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, marginBottom: 6 }}>{q.text}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                  Your answer: <strong>{q.options[answers[idx]] || 'Not answered'}</strong>
                  {!correct && <> | Correct: <strong style={{ color: '#1d9e75' }}>{q.options[q.correct]}</strong></>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, fontStyle: 'italic' }}>{q.explanation}</div>
              </div>
            );
          })}
          <button
            onClick={() => { setAnswers({}); setCurrentQ(0); setSubmitted(false); }}
            style={{
              background: '#0d1b2a', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 24px', cursor: 'pointer', fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
              marginTop: 8,
            }}
          >Retake Assessment</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress header */}
      <div style={{ background: '#0d1b2a', borderRadius: 14, padding: '24px 28px', marginBottom: 20, color: '#fff' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>AML Compliance Assessment</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
          10 questions · 80% required to pass · Question {currentQ + 1} of {ALL_QUESTIONS.length}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#c8963a', borderRadius: 4, width: `${((currentQ + 1) / ALL_QUESTIONS.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question card */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 28px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
          Question {currentQ + 1} of {ALL_QUESTIONS.length}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20, lineHeight: 1.6 }}>{q.text}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map((opt, i) => {
            let bg = '#f8fafc', border = '1.5px solid var(--border)', color = 'var(--text)';
            if (answered) {
              if (i === q.correct) { bg = '#e1f5ee'; border = '1.5px solid #1d9e75'; color = '#1a4a38'; }
              else if (i === answers[currentQ]) { bg = '#fdecea'; border = '1.5px solid #c0392b'; color = '#4a1010'; }
            }
            return (
              <div key={i}
                onClick={() => handleSelect(i)}
                style={{
                  background: bg, border, borderRadius: 10, padding: '12px 16px',
                  cursor: answered ? 'default' : 'pointer', fontSize: 13, color,
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#fff',
                  border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>{String.fromCharCode(65 + i)}</div>
                {opt}
              </div>
            );
          })}
        </div>

        {answered && (
          <div style={{
            marginTop: 14, padding: '12px 16px', borderRadius: 8, fontSize: 12,
            background: isCorrect ? '#f0f7ff' : '#fff5f5',
            border: `1px solid ${isCorrect ? '#bee3f8' : '#fed7d7'}`,
            color: isCorrect ? '#2a4a6b' : '#4a1010',
          }}>
            <strong>Explanation: </strong>{q.explanation}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <button
            onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            style={{
              background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 8,
              padding: '9px 18px', cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
              fontSize: 13, color: 'var(--text2)', fontFamily: 'Inter', opacity: currentQ === 0 ? 0.4 : 1,
            }}
          >← Previous</button>

          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
            {answered ? (currentQ === ALL_QUESTIONS.length - 1 ? 'All done!' : 'Next question →') : 'Select an answer'}
          </span>

          {currentQ < ALL_QUESTIONS.length - 1 ? (
            <button
              onClick={() => setCurrentQ(p => p + 1)}
              disabled={!answered}
              style={{
                background: '#c8963a', border: 'none', borderRadius: 8,
                padding: '9px 18px', cursor: answered ? 'pointer' : 'not-allowed',
                fontSize: 13, color: '#fff', fontFamily: 'Inter', fontWeight: 600,
                opacity: answered ? 1 : 0.4,
              }}
            >Next →</button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              style={{
                background: allAnswered ? '#1d9e75' : '#ccc', border: 'none', borderRadius: 8,
                padding: '9px 18px', cursor: allAnswered ? 'pointer' : 'not-allowed',
                fontSize: 13, color: '#fff', fontFamily: 'Inter', fontWeight: 600,
              }}
            >Submit Assessment</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN TRAINING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Training() {
  const [activeSection, setActiveSection] = useState('overview');

  const navBtn = (id, label, icon) => (
    <button
      key={id}
      onClick={() => setActiveSection(id)}
      style={{
        background: activeSection === id ? 'rgba(200,150,58,0.15)' : 'none',
        border: 'none',
        borderBottom: activeSection === id ? '2px solid #c8963a' : '2px solid transparent',
        cursor: 'pointer',
        color: activeSection === id ? '#c8963a' : 'rgba(255,255,255,0.6)',
        fontFamily: 'Inter', fontSize: 12, fontWeight: 500,
        padding: '10px 14px', whiteSpace: 'nowrap', transition: 'all 0.2s',
      }}
    >{icon} {label}</button>
  );

  return (
    <div className="page" id="export-training">
      {/* Top bar */}
      <div className="topbar">
        <div>
          <h1>AML Training Module</h1>
          <p>Anti-Money Laundering Compliance Training · Payment Aggregator Track · 2026 Edition</p>
        </div>
        <div className="topbar-right">
          <ExportButton targetId="export-training" pageTitle="AML Training Module" subTitle="PPSL Compliance Training 2026" />
        </div>
      </div>

      {/* Sub-nav */}
      <div style={{
        background: '#0d1b2a', borderRadius: 12, marginBottom: 20,
        display: 'flex', overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {SECTIONS.map(s => navBtn(s.id, s.label, s.icon))}
      </div>

      {/* Content area */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '28px 32px', boxShadow: 'var(--shadow)' }}>

        {/* ── OVERVIEW ── */}
        {activeSection === 'overview' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #0d1b2a 0%, #223a55 100%)',
              borderRadius: 14, padding: '36px 40px', color: '#fff', marginBottom: 24,
            }}>
              <div style={{ display: 'inline-block', background: 'rgba(200,150,58,0.2)', color: '#e8b96a', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>
                AML Compliance Training — 2026 Edition
              </div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, marginBottom: 10, lineHeight: 1.3 }}>Anti-Money Laundering<br />Training Module</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, maxWidth: 500, marginBottom: 24 }}>
                A comprehensive training programme for Payment Aggregator AML teams covering global regulatory standards, internal SOPs, and real-world case application.
              </div>
              <div style={{ display: 'flex', gap: 28 }}>
                {[['5', 'Core Modules'], ['10', 'Quiz Questions'], ['80%', 'Pass Threshold'], ['~90 min', 'Est. Duration']].map(([num, lbl], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#e8b96a' }}>{num}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Module Roadmap</h3>
            <TTable
              headers={['Module', 'Topic', 'Key Reference', 'Est. Time']}
              rows={[
                ['<strong>M1</strong>', 'Global & Indian AML Regulatory Framework', 'FATF, PMLA, RBI MD-KYC 2016', '15 min'],
                ['<strong>M2</strong>', 'KYC, CDD, EDD for Payment Aggregators', 'Merchant Onboarding Policy, RBI Guidelines', '20 min'],
                ['<strong>M3</strong>', 'Name Screening Process (RAMP / Jocata)', 'SOP Part I — Name Screening', '20 min'],
                ['<strong>M4</strong>', 'Transaction Monitoring (STAR / Jocata)', 'SOP Part II — Transaction Monitoring', '20 min'],
                ['<strong>M5</strong>', 'STR Filing & Quality Control', 'SOP Part III — STR Process', '15 min'],
              ]}
            />
            <InfoBox type="gold" title="📋 Assessment Rules">
              Complete all 5 modules before attempting the assessment. A minimum score of 80% (8 out of 10 correct) is required to pass.
            </InfoBox>
            <button
              onClick={() => setActiveSection('module1')}
              style={{ background: '#c8963a', border: 'none', borderRadius: 8, padding: '10px 22px', color: '#fff', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
            >Start Module 1 →</button>
          </div>
        )}

        {/* ── MODULE 1 ── */}
        {activeSection === 'module1' && (
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#0d1b2a', marginBottom: 4 }}>Module 1: Global & Indian AML Regulatory Framework</div>
            <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>Understanding FATF, PMLA, and RBI obligations for payment aggregators</div>

            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>1. FATF — The Global Standard-Setter</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 12 }}>
              The Financial Action Task Force (FATF) is an inter-governmental body that sets international standards for combating money laundering (ML), terrorist financing (TF), and proliferation financing. Its 40 Recommendations form the backbone of AML/CFT frameworks worldwide.
            </p>
            <InfoBox type="blue" title="Key FATF Concepts">
              R10 — Customer Due Diligence · R16 — Wire Transfers ("Travel Rule") · R20 — Reporting of Suspicious Transactions · R35 — Sanctions Implementation. India is a FATF member since 2010.
            </InfoBox>

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '20px 0 10px' }}>2. Indian AML Legal Architecture</h3>
            <TTable
              headers={['Legislation', 'Key Obligation', 'Authority']}
              rows={[
                ['<strong>PMLA 2002</strong>', 'Criminalises money laundering; mandates KYC & record-keeping; reporting to FIU-IND', 'Ministry of Finance / ED'],
                ['<strong>RBI MD-KYC 2016</strong>', 'KYC norms for REs; CDD, EDD, PEP identification; ongoing monitoring', 'Reserve Bank of India'],
                ['<strong>RBI PA/PG Guidelines 2020</strong>', 'Merchant onboarding standards; AML compliance for payment aggregators', 'Reserve Bank of India'],
                ['<strong>UAPA 1967</strong>', 'Screening against MHA/UNSC terrorist designation lists', 'Ministry of Home Affairs'],
              ]}
            />

            <KnowledgeCheck
              id="kc1"
              question="Which FATF Recommendation specifically requires Reporting Entities to file reports of suspicious transactions?"
              options={['Recommendation 10 — Customer Due Diligence', 'Recommendation 16 — Wire Transfers', 'Recommendation 20 — Reporting of Suspicious Transactions', 'Recommendation 35 — Sanctions']}
              correctIdx={2}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setActiveSection('module2')} style={{ background: '#c8963a', border: 'none', borderRadius: 8, padding: '10px 22px', color: '#fff', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Next: Module 2 →</button>
            </div>
          </div>
        )}

        {/* ── MODULE 2 ── */}
        {activeSection === 'module2' && (
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#0d1b2a', marginBottom: 4 }}>Module 2: KYC, CDD & EDD for Payment Aggregators</div>
            <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>Customer identification, due diligence tiers, and enhanced measures for high-risk merchants</div>

            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>1. KYC — Know Your Customer</h3>
            <TTable
              headers={['KYC Pillar', 'PA Application']}
              rows={[
                ['<strong>Customer Identification</strong>', 'Verify merchant legal name, business type, UBOs, directors via official documents'],
                ['<strong>Beneficial Ownership</strong>', 'Identify natural persons owning ≥25% (or ≥10% for listed entities) of the merchant entity'],
                ['<strong>Ongoing Due Diligence</strong>', 'Periodic re-verification; trigger-based re-KYC on material changes'],
                ['<strong>Record Keeping</strong>', 'Retain KYC records for minimum 5 years after end of relationship'],
              ]}
            />

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '20px 0 10px' }}>2. EDD — Enhanced Due Diligence</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 10 }}>EDD is mandatory for:</p>
            <ul style={{ fontSize: 13, color: 'var(--text2)', paddingLeft: 20, lineHeight: 1.9 }}>
              <li>Politically Exposed Persons (PEPs) and their close family members</li>
              <li>Merchants from FATF grey-listed jurisdictions</li>
              <li>Complex ownership structures (offshore, nominee directors)</li>
              <li>High-risk business categories (gambling, crypto, forex, arms)</li>
            </ul>
            <InfoBox type="red" title="⚠ EDD Measures Include">
              Senior management approval for onboarding · Enhanced source-of-funds verification · More frequent transaction monitoring · Periodic re-assessment at least annually
            </InfoBox>

            <KnowledgeCheck
              id="kc2"
              question="A merchant's director is identified as a former senior government official of a foreign country. What due diligence measure is MANDATORY?"
              options={['Standard CDD — no additional measures required', 'Enhanced Due Diligence (EDD) including senior management approval', 'Immediate account termination', 'File an STR immediately']}
              correctIdx={1}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button onClick={() => setActiveSection('module1')} style={{ background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 13, color: 'var(--text2)', fontFamily: 'Inter' }}>← Module 1</button>
              <button onClick={() => setActiveSection('module3')} style={{ background: '#c8963a', border: 'none', borderRadius: 8, padding: '10px 22px', color: '#fff', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Next: Module 3 →</button>
            </div>
          </div>
        )}

        {/* ── MODULE 3 ── */}
        {activeSection === 'module3' && (
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#0d1b2a', marginBottom: 4 }}>Module 3: Name Screening Process</div>
            <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>Watchlist management, screening modes, alert review, and true match / false positive determination</div>

            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>1. Screening Modes (Jocata RAMP)</h3>
            <TTable
              headers={['Mode', 'Trigger', 'Frequency']}
              rows={[
                ['<strong>Onboarding / API</strong>', 'New merchant joining PPSL', 'At onboarding (real-time)'],
                ['<strong>Scheduled (Incremental)</strong>', 'New/updated watchlist entries from Accuity', 'Daily (automated)'],
                ['<strong>Triggered Event</strong>', 'Merchant demographic data update', 'Event-driven'],
                ['<strong>On-Demand</strong>', 'Ad-hoc analyst investigation', 'As required'],
                ['<strong>Bulk Screening</strong>', 'Mass re-screening project', 'As required'],
              ]}
            />

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '20px 0 10px' }}>2. Alert Review Process — L1 / L2 / L3</h3>
            <ProcessFlow steps={[
              { num: 'L1', label: 'Initial Review', sub: 'Face-value comparison; close or escalate' },
              { num: 'L2', label: 'Detailed Investigation', sub: 'Deep-dive; source system check' },
              { num: 'L3', label: 'Expert Review', sub: 'Final determination; GOS prep' },
              { num: 'PO', label: 'Principal Officer', sub: 'Approves STR; final closure' },
            ]} />

            <InfoBox type="gold" title="⚠ Tipping Off Prohibition">
              Under PMLA, disclosing to any person that an ML/TF investigation is being conducted is a criminal offence. Analysts must NEVER communicate investigation status to the subject merchant.
            </InfoBox>

            <KnowledgeCheck
              id="kc3"
              question="An L1 analyst receives an alert where the merchant name matches a watchlist entry, but the date of birth is different. What should the analyst do?"
              options={['Immediately file an STR as the name is a match', 'Compare all available parameters and likely close as False Positive; escalate to L2 if uncertain', 'Inform the merchant that they are being screened', 'Close the alert immediately — DOB mismatch always means false positive']}
              correctIdx={1}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button onClick={() => setActiveSection('module2')} style={{ background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 13, color: 'var(--text2)', fontFamily: 'Inter' }}>← Module 2</button>
              <button onClick={() => setActiveSection('module4')} style={{ background: '#c8963a', border: 'none', borderRadius: 8, padding: '10px 22px', color: '#fff', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Next: Module 4 →</button>
            </div>
          </div>
        )}

        {/* ── MODULE 4 ── */}
        {activeSection === 'module4' && (
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#0d1b2a', marginBottom: 4 }}>Module 4: Transaction Monitoring Process</div>
            <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>Online monitoring, alert investigation workflow, and the Jocata STAR platform</div>

            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>1. Alert Handling Workflow</h3>
            <ProcessFlow steps={[
              { num: '1', label: 'Rule Trigger', sub: 'STAR generates alert → L1 tray' },
              { num: '2', label: 'L1 Investigation', sub: 'Initial review: close or escalate' },
              { num: '3', label: 'L2 Deep-Dive', sub: 'Detailed review; source systems' },
              { num: '4', label: 'L3 Expert Review', sub: 'GOS preparation; STR decision' },
              { num: '5', label: 'PO Decision', sub: 'Approve STR / Close' },
            ]} />

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '20px 0 10px' }}>2. Quality Check (QC) Programme</h3>
            <TTable
              headers={['QC Checker', 'Checks Closures By', 'Sampling Basis']}
              rows={[
                ['L2 Analyst', 'L1 Analyst (non-suspicious closures)', 'Sample basis — periodic'],
                ['L3 Analyst', 'L2 Analyst (non-suspicious closures)', 'Monthly (4–5 rules)'],
                ['Principal Officer', 'L2 Analyst (non-suspicious closures)', 'Sample basis — periodic'],
              ]}
            />

            <InfoBox type="blue" title="L1 Investigation Focus Areas">
              Nature of merchant's business · Expected vs actual transaction patterns · Counterparty analysis · Geographic risk · Prior STR history · Adverse media · Cross-referencing BOSS Panel and Onboarding Engine data
            </InfoBox>

            <KnowledgeCheck
              id="kc4"
              question="An L1 analyst cannot reach a definitive conclusion on a suspicious transaction alert. What is the correct course of action?"
              options={['Close the alert as non-suspicious to avoid backlog', 'Contact the merchant directly for an explanation', 'Escalate the alert to L2 with appropriate investigation comments', 'File an STR immediately since the analyst is unsure']}
              correctIdx={2}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button onClick={() => setActiveSection('module3')} style={{ background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 13, color: 'var(--text2)', fontFamily: 'Inter' }}>← Module 3</button>
              <button onClick={() => setActiveSection('module5')} style={{ background: '#c8963a', border: 'none', borderRadius: 8, padding: '10px 22px', color: '#fff', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Next: Module 5 →</button>
            </div>
          </div>
        )}

        {/* ── MODULE 5 ── */}
        {activeSection === 'module5' && (
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#0d1b2a', marginBottom: 4 }}>Module 5: STR Filing & Quality Control</div>
            <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>Suspicious Transaction Report preparation, Ground of Suspicion, and FIU-IND filing</div>

            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>1. STR Filing Process — Step by Step</h3>
            <ProcessFlow steps={[
              { num: '1', label: 'L3 Prepares GOS', sub: 'Ground of Suspicion narrative' },
              { num: '2', label: 'STR Drafted in STAR', sub: 'Fingate 2.0 format' },
              { num: '3', label: 'Centra Approval', sub: 'PO reviews & approves' },
              { num: '4', label: 'Fingate 2.0 Upload', sub: 'Filed with FIU-IND' },
              { num: '5', label: 'Record & Monitor', sub: 'Post-STR monitoring continues' },
            ]} />

            <InfoBox type="red" title="⚠ Legal Obligations">
              Failure to file an STR when required is a criminal offence under PMLA. STR contents are strictly confidential — disclosure to the subject ("Tipping Off") is a separate criminal offence. STR must be filed within <strong>7 days</strong> of forming suspicion.
            </InfoBox>

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '20px 0 10px' }}>2. Ground of Suspicion (GOS) Quality Tips</h3>
            <InfoBox type="green" title="GOS Quality Tips">
              A GOS must be factual, specific, and clearly reasoned. Avoid vague language. Instead write: <em>"Merchant processed 42 transactions of ₹49,500 each within 72 hours — a pattern consistent with structuring to avoid the ₹50,000 reporting threshold."</em>
            </InfoBox>

            <KnowledgeCheck
              id="kc5"
              question="After an STR is prepared by L3, which step must occur BEFORE it is uploaded to the Fingate 2.0 portal?"
              options={['The merchant must be notified', 'The L1 analyst who originally raised the alert must re-review it', 'The Principal Officer must approve the case in the Centra module of Jocata', 'An external legal counsel must review']}
              correctIdx={2}
            />

            <InfoBox type="gold" title="🎓 Module Completion">
              You have completed all 5 training modules. You are now ready to attempt the Assessment. A score of 80% or above is required to pass.
            </InfoBox>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button onClick={() => setActiveSection('module4')} style={{ background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 13, color: 'var(--text2)', fontFamily: 'Inter' }}>← Module 4</button>
              <button onClick={() => setActiveSection('quiz')} style={{ background: '#c8963a', border: 'none', borderRadius: 8, padding: '10px 22px', color: '#fff', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Attempt Assessment →</button>
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {activeSection === 'quiz' && <QuizSection />}
      </div>
    </div>
  );
}