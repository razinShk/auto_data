import React, { useState } from 'react';
import { FileSpreadsheet, Shield, Upload, BarChart3, Users, Download, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import ProjectSelector from "@/components/ProjectSelector";
import MultiRowDataEntry from "@/components/MultiRowDataEntry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { currentProject } = useProject();
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  if (currentProject) {
    return <MultiRowDataEntry />;
  }

  if (showProjectSelector) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">Excel Observer</h1>
              <Button 
                variant="outline" 
                onClick={() => setShowProjectSelector(false)}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Home
              </Button>
            </div>
            <ProjectSelector />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800 border-blue-200">
                <Sparkles className="h-4 w-4 mr-2" />
                Advanced Data Collection Platform
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Excel Observer
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Data Collection Made Simple
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your data collection workflow with our powerful Excel-based observation platform. 
              Create secure projects, upload data seamlessly, and generate comprehensive reports with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => setShowProjectSelector(true)}
                size="lg"
                className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg font-semibold border-2 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
              >
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Excel Observer?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for professionals who need reliable, secure, and efficient data collection solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Projects",
                description: "Password-protected projects ensure your data remains confidential and accessible only to authorized users.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Upload,
                title: "Excel Integration",
                description: "Seamlessly upload and process Excel files with our intelligent data parsing and validation system.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: BarChart3,
                title: "Data Analytics",
                description: "Generate comprehensive reports and visualizations to gain meaningful insights from your collected data.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Users,
                title: "Multi-User Support",
                description: "Collaborate with team members while maintaining data integrity and access control.",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Download,
                title: "Export Options",
                description: "Export your data in multiple formats including Excel, PDF, and CSV for further analysis.",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: CheckCircle,
                title: "Data Validation",
                description: "Built-in validation rules ensure data quality and consistency across all your observations.",
                color: "from-teal-500 to-green-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-105">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "10,000+", label: "Data Points Collected" },
              { number: "500+", label: "Active Projects" },
              { number: "99.9%", label: "Uptime Reliability" }
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Data Collection?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust Excel Observer for their data collection needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowProjectSelector(true)}
              size="lg"
              className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Create Your First Project
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <FileSpreadsheet className="h-6 w-6" />
              <span className="text-xl font-bold">Excel Observer</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Excel Observer. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
