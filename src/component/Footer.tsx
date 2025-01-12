import { Twitter, Linkedin, Github, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="flex justify-center items-center bg-white py-1 border-t border-gray-200">
            <div className="container">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4">
                    <div className="flex items-center text-gray-700">
                        <span className='sm:text-sm text-xs'>Built by Fixxoo with</span>
                        <Heart className="w-4 h-4 mx-1 text-red-500 fill-current animate-pulse" />
                        <span>love</span>
                    </div>
                    <div className="flex space-x-4 sm:space-x-6">
                        <a
                            href="https://x.com/Raj_FixxooXD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-orange-500 transition-colors duration-300"
                        >
                            <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/raj-palmal-a736ab233/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-orange-500 transition-colors duration-300"
                        >
                            <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
                        </a>
                        <a
                            href="https://github.com/FixxooXD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-orange-500 transition-colors duration-300"
                        >
                            <Github className="w-5 h-5 sm:w-6 sm:h-6" />
                        </a>
                    </div>

                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Fixxoo. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;