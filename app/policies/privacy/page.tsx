import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 dark:bg-zinc-950">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-md border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
                    <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-zinc-100">
                        Privacy Policy for Luna
                    </h1>

                    <p className="mb-4 text-sm text-gray-500 dark:text-zinc-400">
                        Last Updated: September 6, 2025
                    </p>

                    <div className="space-y-6 text-gray-700 dark:text-zinc-300">
                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">1. Introduction</h2>
                            <p>
                                Welcome to Luna (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application to manage event communications. By using Luna, you agree to the collection and use of information in accordance with this policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">2. Information We Collect</h2>
                            <p className="mb-2">We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>
                                    <strong>Personal Data:</strong> When you register using Google Sign-In, we collect personal information that you provide to us such as your name, email address, and a unique user ID.
                                </li>
                                <li>
                                    <strong>Event and Announcement Data:</strong> We collect all content and information you provide when creating and managing events, including titles, descriptions, locations, attachments, and announcements.
                                </li>
                                <li>
                                    <strong>Subscriber Information:</strong> For public event attendees who choose to receive notifications, we collect a Firebase Cloud Messaging (FCM) token. This token is anonymous and is not linked to any personal user account.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">3. How We Use Your Information</h2>
                            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>Create and manage your account and events.</li>
                                <li>Deliver live announcements and updates to event subscribers.</li>
                                <li>Send administrative communications, such as admin invitations.</li>
                                <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">4. Disclosure of Your Information</h2>
                            <p>We do not sell your personal information. We may share information we have collected about you in certain situations, including:</p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>
                                    <strong>With Third-Party Service Providers:</strong> We use Google and Firebase for authentication, database, storage, and notification services. Your information is subject to their respective privacy policies.
                                </li>
                                <li>
                                    <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process or protect the rights, property, and safety of others, we may share your information.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">5. Data Security</h2>
                            <p>
                                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">6. Contact Us</h2>
                            <p>
                                If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:[Your Contact Email]" className="text-blue-500 hover:underline">[Your Contact Email]</a>.
                            </p>
                        </section>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                        &larr; Back to Login
                    </Link>
                </div>
            </div>
        </main>
    );
}