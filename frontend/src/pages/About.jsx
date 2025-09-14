import React from 'react'
import { Linkedin, Github } from 'lucide-react';


function About() {
    return (
        <div className="min-h-screen bg-gray-950 flex justify-center items-start pb-16">
            <div className="w-11/12 md:w-7/12 bg-zinc-800 text-white flex flex-col items-center p-8 rounded-2xl shadow-2xl mt-20">
                {/* Logo and Title */}
                <div className="flex flex-col items-center mb-6">
                    <img src="/vite.png" alt="BlockHire Logo" className="w-16 h-16 mb-2" />
                    <h1 className="text-4xl font-bold text-yellow-400 mb-1 tracking-tight">BlockHire</h1>
                    <span className="text-lg text-gray-300 font-mono">Decentralized Freelance Marketplace</span>
                </div>

                {/* About BlockHire */}
                <div className="w-full mt-4 mb-8">
                    <h2 className="text-2xl font-semibold text-red-500 mb-2">What is BlockHire?</h2>
                    <p className="text-gray-200 text-lg leading-relaxed">
                        BlockHire is a next-generation freelance platform powered by blockchain technology. We connect clients and freelancers directly, enabling trustless, transparent, and secure job contracts using smart contracts and decentralized storage.
                    </p>
                </div>

                {/* Mission Section */}
                <div className="w-full mb-8">
                    <h2 className="text-2xl font-semibold text-red-500 mb-2">Our Mission</h2>
                    <p className="text-gray-200 text-lg leading-relaxed">
                        Our mission is to empower freelancers and clients by eliminating intermediaries, reducing fees, and ensuring fair, automated payments. We believe in a borderless, censorship-resistant, and open job marketplace for everyone.
                    </p>
                </div>

                {/* How it Works Section */}
                <div className="w-full mb-8">
                    <h2 className="text-2xl font-semibold text-red-500 mb-2">How It Works</h2>
                    <ul className="list-disc pl-6 text-gray-200 text-lg space-y-2">
                        <li><span className="text-yellow-400 font-semibold">1. Register:</span> Connect your wallet and register as a client or freelancer.</li>
                        <li><span className="text-yellow-400 font-semibold">2. Post or Bid:</span> Clients post jobs with budgets; freelancers place bids and submit proposals.</li>
                        <li><span className="text-yellow-400 font-semibold">3. Escrow & Security:</span> Funds are locked in a smart contract escrow until work is approved.</li>
                        <li><span className="text-yellow-400 font-semibold">4. Delivery & Payment:</span> Freelancers deliver work; clients approve and release payment instantly.</li>
                        <li><span className="text-yellow-400 font-semibold">5. Dispute Resolution:</span> Disputes are handled transparently on-chain for fairness.</li>
                    </ul>
                </div>

                {/* Features Section */}
                <div className="w-full mb-8">
                    <h2 className="text-2xl font-semibold text-red-500 mb-2">Key Features</h2>
                    <ul className="list-disc pl-6 text-gray-200 text-lg space-y-2">
                        <li><span className="text-yellow-400">Smart contract escrow</span> for secure payments</li>
                        <li><span className="text-yellow-400">Decentralized storage</span> for job specs and submissions</li>
                        <li><span className="text-yellow-400">No platform fees</span> — keep what you earn</li>
                        <li><span className="text-yellow-400">Open to all</span> — global, permissionless access</li>
                        <li><span className="text-yellow-400">Transparent & auditable</span> — all actions on-chain</li>
                    </ul>
                </div>

                {/* Mentor Section */}
                <div className="w-full mt-10 mb-8">
                    <h2 className="text-2xl font-semibold text-red-500 mb-2">Meet the Mentor</h2>
                    <div className="bg-zinc-900 p-4 rounded-xl shadow flex flex-col md:flex-row items-center md:items-start">
                        <div className="flex-shrink-0 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-red-600 mr-4">SPS</div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-yellow-400">Dr Shailendra Pratap Singh</h3>
                                <a href="https://www.linkedin.com/in/dr-shailendra-pratap-singh-36740847/" target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                </a>
                            </div>
                            <p className="text-gray-400 text-sm italic mt-1">Associate Professor, Computer Science and Engineering Department, Madan Mohan Malaviya University of Technology, Gorakhpur</p>
                            <p className="text-gray-200 mt-2">Provided invaluable guidance and mentorship throughout the project's development.</p>
                        </div>
                    </div>
                </div>

                {/* Developers Section */}
                <div className="w-full mt-10 mb-8">
                    <h2 className="text-2xl font-semibold text-red-500 mb-2">Meet the Developers</h2>
                    <div className="flex flex-col gap-6">
                        <div className="bg-zinc-900 p-4 rounded-xl shadow flex flex-col md:flex-row items-center md:items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-red-600 mr-4">H</div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-yellow-400">Harsh</h3>
                                    <a href="https://www.linkedin.com/in/harsh-cse/" target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                    </a>
                                    <a href="https://github.com/harsh-c-s-e" target="_blank" rel="noopener noreferrer">
                                        <Github className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                    </a>
                                </div>
                                <p className="text-gray-200">Blockchain developer and architect. Harsh led the smart contract design and security, ensuring trustless transactions and robust escrow logic.</p>
                            </div>
                        </div>
                        <div className="bg-zinc-900 p-4 rounded-xl shadow flex flex-col md:flex-row items-center md:items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-red-600 mr-4">MK</div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-yellow-400">Mayank Kushwah</h3>
                                    <a href="https://www.linkedin.com/in/k-mayank/" target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                    </a>
                                    <a href="https://github.com/Bit-Mayank" target="_blank" rel="noopener noreferrer">
                                        <Github className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                    </a>
                                </div>
                                <p className="text-gray-200">Frontend and UX specialist. Mayank crafted the user experience and interface, making BlockHire intuitive and visually appealing for all users.</p>
                            </div>
                        </div>
                        <div className="bg-zinc-900 p-4 rounded-xl shadow flex flex-col md:flex-row items-center md:items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-red-600 mr-4">PS</div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-yellow-400">Praduin sharma</h3>
                                    <a href="https://www.linkedin.com/in/praduin-sharma-52a606257/" target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                    </a>
                                    <a href="https://github.com/praduin" target="_blank" rel="noopener noreferrer">
                                        <Github className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                    </a>
                                </div>
                                <p className="text-gray-200">Full-stack developer and mentor. Praduin provided technical guidance, code reviews, and helped integrate decentralized storage and dispute resolution features.</p>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Call to Action */}
                <div className="w-full flex flex-col items-center mt-4">
                    <span className="text-xl text-gray-300 mb-2">Ready to get started?</span>
                    <a href="/" className="bg-yellow-400 text-red-600 font-bold px-6 py-2 rounded-lg shadow hover:bg-yellow-300 transition">Go to Home</a>
                </div>
            </div>
        </div>
    );
}

export default About