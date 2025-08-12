const Footer = () => {
    return (
      <footer className="w-full border-t bg-card text-card-foreground">
        <div className="container flex items-center justify-center py-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Gymnasium Zenith. All rights reserved.
          </p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  