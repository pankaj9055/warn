interface ServiceCardProps {
  name: string;
  icon: string;
  color: string;
  services: Array<{
    name: string;
    price: string;
  }>;
  delay?: number;
}

export function ServiceCard({ name, icon, color, services, delay = 0 }: ServiceCardProps) {
  return (
    <div 
      className="glass-card p-6 rounded-2xl hover-lift float-animation"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-center mb-4">
        <div 
          className={`w-16 h-16 rounded-2xl flex items-center justify-center`}
          style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
        >
          <i className={`${icon} text-2xl text-white`}></i>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-center mb-2">{name}</h3>
      
      <div className="space-y-2 text-sm">
        {services.map((service, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-400">{service.name}:</span>
            <span className="text-green-400">{service.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
