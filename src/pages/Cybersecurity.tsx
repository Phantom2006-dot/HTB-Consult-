import { FormEvent, useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, ChevronDown, ShieldCheck } from "lucide-react";
import "./Cybersecurity.css";

const learningPoints = [
  "Digital foundations and core cybersecurity concepts",
  "Operating-system, endpoint and network defence",
  "Cyber threats, identity and data protection",
  "Vulnerability management, security monitoring and incident handling",
  "Governance, risk, integration and career progression",
];

const countries = ["United Kingdom", "Nigeria", "Other"];
const backgrounds = ["Student", "Graduate", "Career changer", "IT professional", "Other"];

const Cybersecurity = () => {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Cybersecurity | Register your interest | HTB Academy";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="cyber-page">
      <header className="cyber-header">
        <a className="cyber-brand" href="/" aria-label="HTB Academy home">
          <span className="cyber-brandmark">HTB</span>
          <span className="cyber-brandname">
            ACADEMY
            <small>THINK. ANALYSE. IMPROVE.</small>
          </span>
        </a>
        <a className="cyber-back" href="/">
          <ArrowDown size={16} aria-hidden="true" /> Back to academy
        </a>
      </header>

      <main>
        <section className="cyber-hero" aria-labelledby="cyber-title">
          <div className="cyber-intro">
            <p className="cyber-eyebrow"><span /> Your next chapter starts here</p>
            <h1 id="cyber-title">Curious about<br />cybersecurity?<br /><em>Start here.</em></h1>
            <p className="cyber-lede">Build your understanding. Explore a new direction. Take the first step towards learning cybersecurity with HTB Academy.</p>
            <div className="cyber-tags" aria-label="Who this programme is for">
              <span>Students &amp; graduates</span>
              <span>Career changers</span>
              <span>New to cybersecurity</span>
            </div>
            <div className="cyber-programme">
              <div className="cyber-shield"><ShieldCheck size={28} strokeWidth={1.4} aria-hidden="true" /></div>
              <div>
                <small>Cybersecurity bootcamp</small>
                <strong>A practical foundation.<br />A clearer way forward.</strong>
                <p>Five learning days · 30 hours</p>
              </div>
            </div>
            <p className="cyber-cohort">First cohort planned for December 2026.<br />Exact dates, delivery arrangements and fees will be confirmed.</p>
            <a className="cyber-explore" href="#learning">Explore what you’ll learn <ArrowDown size={17} aria-hidden="true" /></a>
          </div>

          <div className="cyber-formcard" id="register">
            <div className="cyber-formtop"><span className="cyber-eyebrow">Let’s get to know you</span><span className="cyber-step">01 / First step</span></div>
            <h2>{submitted ? "You’re on the list." : "Register your interest"}</h2>
            {submitted ? (
              <div className="cyber-success" role="status">
                <div className="cyber-success-icon"><Check size={22} aria-hidden="true" /></div>
                <p>Thanks for sharing your details. We’ll be in touch with programme information and next steps.</p>
                <button className="cyber-textbutton" type="button" onClick={() => setSubmitted(false)}>Submit another response</button>
              </div>
            ) : (
              <>
                <p>Tell us a little about yourself. We’ll contact you with programme details and the next steps.</p>
                <form onSubmit={handleSubmit}>
                  <label>Full name <b>*</b><input autoComplete="name" placeholder="Your full name" required maxLength={100} name="name" /></label>
                  <label>Email address <b>*</b><input type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} name="email" /></label>
                  <div className="cyber-formrow">
                    <label>Country of residence <b>*</b><span className="cyber-select"><select name="country" defaultValue="" required><option value="" disabled>Select country</option>{countries.map((country) => <option key={country}>{country}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></span></label>
                    <label>Current background <b>*</b><span className="cyber-select"><select name="background" defaultValue="" required><option value="" disabled>Select background</option>{backgrounds.map((background) => <option key={background}>{background}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></span></label>
                  </div>
                  <label>What would you like to achieve? <span className="cyber-optional">Optional</span><textarea name="goal" maxLength={1000} placeholder="For example, understand the basics before changing careers." rows={2} /></label>
                  <label className="cyber-consent"><input type="checkbox" required name="consent" /><span>I agree to HTB Academy contacting me by email about this cybersecurity programme. <a href="#privacy">How we use your details</a></span></label>
                  <button className="cyber-submit" type="submit">Register my interest <ArrowUpRight size={18} aria-hidden="true" /></button>
                  <p className="cyber-no-payment">No payment required. No obligation to enrol.</p>
                </form>
              </>
            )}
          </div>
        </section>

        <section className="cyber-learning" id="learning">
          <div className="cyber-learning-intro"><p className="cyber-eyebrow">Your learning starts with the foundations</p><h2>Get to grips with<br />what matters.</h2><p>Explore the core areas of cybersecurity through a practical introductory programme.</p><a className="cyber-textlink" href="#register">Take the first step <ArrowUpRight size={17} aria-hidden="true" /></a></div>
          <ol>{learningPoints.map((point, index) => <li key={point}><span>0{index + 1}</span>{point}</li>)}</ol>
        </section>

        <section className="cyber-next"><p className="cyber-eyebrow">What happens next?</p><div className="cyber-nextgrid"><article><span>01</span><h3>Share your interest</h3><p>Complete the short form. You don’t need to create an account.</p></article><article><span>02</span><h3>Get the details</h3><p>Receive information about dates, fees and how the programme will run.</p></article><article><span>03</span><h3>Decide when you’re ready</h3><p>Review the information and choose whether you’d like to enrol.</p></article></div></section>

        <section className="cyber-privacy" id="privacy"><h3>Your details, handled with care.</h3><p>HTB Academy, operated by HTB Consult Ltd, will store the details you submit and use them to respond to your interest in this cybersecurity programme. This form does not subscribe you to unrelated marketing. To withdraw your interest or request deletion of your details, email <a href="mailto:training@htbconsults.com">training@htbconsults.com</a>.</p></section>
      </main>

      <footer className="cyber-footer"><span>HTB ACADEMY <small>by HTB Consult</small></span><a href="mailto:training@htbconsults.com">Questions? Let’s talk <ArrowUpRight size={16} aria-hidden="true" /></a><span>Think. Analyse. Improve.</span></footer>
    </div>
  );
};

export default Cybersecurity;
