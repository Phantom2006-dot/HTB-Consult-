import { FormEvent, useEffect, useState } from "react";
import "./Cybersecurity.css";

const Cybersecurity = () => {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Cybersecurity | Register your interest | HTB Academy";
    return () => { document.title = previousTitle; };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="cyber-page">
      <header>
        <a className="brand" href="/">
          <span className="brandmark">HTB</span>
          <span>ACADEMY<small>THINK. ANALYSE. IMPROVE.</small></span>
        </a>
        <a className="back" href="/">← Back to academy</a>
      </header>
      <main>
        <section className="hero">
          <div className="intro">
            <div className="eyebrow"><span /> YOUR NEXT CHAPTER STARTS HERE</div>
            <h1>Curious about<br />cybersecurity?<br /><em>Start here.</em></h1>
            <p className="lede">Build your understanding. Explore a new direction. Take the first step towards learning cybersecurity with HTB Academy.</p>
            <div className="tags"><span>Students &amp; graduates</span><span>Career changers</span><span>New to cybersecurity</span></div>
            <div className="programme"><div className="shield">⌁</div><div><small>CYBERSECURITY BOOTCAMP</small><strong>A practical foundation.<br />A clearer way forward.</strong><p>Five learning days · 30 hours</p></div></div>
            <p className="cohort">First cohort planned for December 2026.<br />Exact dates, delivery arrangements and fees will be confirmed.</p>
            <a className="explore" href="#learning">Explore what you’ll learn ↓</a>
          </div>
          <div className="formcard" id="register">
            {submitted ? <div className="success" role="status"><span>✓</span><p>Thanks for sharing your details. We’ll be in touch with programme information and next steps.</p><button className="secondary" type="button" onClick={() => setSubmitted(false)}>Submit another response</button></div> : <>
              <div className="form-top"><span className="eyebrow">LET’S GET TO KNOW YOU</span><span className="step">01 / FIRST STEP</span></div>
              <h2>Register your interest</h2>
              <p>Tell us a little about yourself. We’ll contact you with programme details and the next steps.</p>
              <form onSubmit={handleSubmit}>
                <label>Full name <b>*</b><input autoComplete="name" placeholder="Your full name" required maxLength={100} name="name" /></label>
                <label>Email address <b>*</b><input type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} name="email" /></label>
                <div className="row"><label>Country of residence <b>*</b><select name="country" defaultValue="" required><option value="" disabled>Select country</option><option>United Kingdom</option><option>Nigeria</option><option>Other</option></select></label><label>Current background <b>*</b><select name="background" defaultValue="" required><option value="" disabled>Select background</option><option>Student</option><option>Graduate</option><option>Career changer</option><option>IT professional</option><option>Other</option></select></label></div>
                <label>What would you like to achieve? <span className="optional">Optional</span><textarea name="goal" maxLength={1000} placeholder="For example, understand the basics before changing careers." rows={2} /></label>
                <div className="trap" aria-hidden="true"><input tabIndex={-1} autoComplete="off" name="website" /></div>
                <label className="consent"><input type="checkbox" required name="consent" /><span>I agree to HTB Academy contacting me by email about this cybersecurity programme. <a href="#privacy">How we use your details</a></span></label>
                <button className="submit" type="submit">Register my interest<span>↗</span></button>
                <p className="no-payment">No payment required. No obligation to enrol.</p>
              </form>
            </>}
          </div>
        </section>
        <section className="learning" id="learning"><div><span className="eyebrow">YOUR LEARNING STARTS WITH THE FOUNDATIONS</span><h2>Get to grips with<br />what matters.</h2><p>Explore the core areas of cybersecurity through a practical introductory programme.</p><a href="#register" className="textlink">Take the first step ↗</a></div><ol><li><span>01</span>Digital foundations and core cybersecurity concepts</li><li><span>02</span>Operating-system, endpoint and network defence</li><li><span>03</span>Cyber threats, identity and data protection</li><li><span>04</span>Vulnerability management, security monitoring and incident handling</li><li><span>05</span>Governance, risk, integration and career progression</li></ol></section>
        <section className="next"><span className="eyebrow">WHAT HAPPENS NEXT?</span><div className="nextgrid"><article><span>01</span><h3>Share your interest</h3><p>Complete the short form. You don’t need to create an account.</p></article><article><span>02</span><h3>Get the details</h3><p>Receive information about dates, fees and how the programme will run.</p></article><article><span>03</span><h3>Decide when you’re ready</h3><p>Review the information and choose whether you’d like to enrol.</p></article></div></section>
        <section className="privacy" id="privacy"><h3>Your details, handled with care.</h3><p>HTB Academy, operated by HTB Consult Ltd, will store the details you submit and use them to respond to your interest in this cybersecurity programme. This form does not subscribe you to unrelated marketing. To withdraw your interest or request deletion of your details, email <a href="mailto:training@htbconsults.com">training@htbconsults.com</a>.</p></section>
      </main>
      <footer><span>HTB ACADEMY <small>by HTB Consult</small></span><a href="mailto:training@htbconsults.com">Questions? Let’s talk ↗</a><span>Think. Analyse. Improve.</span></footer>
    </div>
  );
};

export default Cybersecurity;
