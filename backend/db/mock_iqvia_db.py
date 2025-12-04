"""
Mock IQVIA MIDAS Database Model
================================
Simulates a pharmaceutical market analytics database with realistic structure,
relationships, and sample data for testing analytics pipelines.

Features:
- Complete ORM models with relationships
- Sample data generation
- Query helpers for analytics
- SQLite export support
- Optional enhancements (DateDimension, CurrencyConversion, MarketShare)
"""

import os
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional
import random

from sqlalchemy import (
    create_engine, 
    Column, 
    Integer, 
    String, 
    Numeric, 
    Date, 
    ForeignKey,
    Index,
    func,
    desc,
    CheckConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from faker import Faker

# Initialize Faker for generating realistic data
fake = Faker()

# Base class for all models
Base = declarative_base()


# ==================== CORE TABLES ====================

class Company(Base):
    """Pharmaceutical company information"""
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(200), nullable=False, unique=True)
    headquarters_country = Column(String(100), nullable=False)
    founded_year = Column(Integer)
    global_rank = Column(Integer)

    # Relationships
    products = relationship("Product", back_populates="company", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Company(id={self.company_id}, name='{self.company_name}', rank={self.global_rank})>"


class ATCClassification(Base):
    """Anatomical Therapeutic Chemical (ATC) Classification System"""
    __tablename__ = "atc_classifications"

    atc_code = Column(String(7), primary_key=True)  # e.g., "A02BC01"
    atc_level1 = Column(String(100), nullable=False)  # Anatomical main group
    atc_level2 = Column(String(100), nullable=False)  # Therapeutic subgroup
    atc_level3 = Column(String(100), nullable=False)  # Pharmacological subgroup
    atc_level4 = Column(String(100), nullable=False)  # Chemical subgroup
    description = Column(String(500))

    # Relationships
    products = relationship("Product", back_populates="atc_classification")

    def __repr__(self):
        return f"<ATC(code='{self.atc_code}', level1='{self.atc_level1}')>"


class Product(Base):
    """Pharmaceutical product information"""
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, autoincrement=True)
    product_name = Column(String(200), nullable=False)
    active_ingredient = Column(String(200), nullable=False)
    dosage_form = Column(String(100))  # e.g., "Tablet", "Injection", "Syrup"
    strength = Column(String(50))  # e.g., "500mg", "10mg/ml"
    atc_code = Column(String(7), ForeignKey("atc_classifications.atc_code"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    approval_date = Column(Date)
    patent_expiry = Column(Date)

    # Relationships
    company = relationship("Company", back_populates="products")
    atc_classification = relationship("ATCClassification", back_populates="products")
    sales = relationship("Sales", back_populates="product", cascade="all, delete-orphan")

    # Indexes for performance
    __table_args__ = (
        Index("idx_product_atc", "atc_code"),
        Index("idx_product_company", "company_id"),
    )

    def __repr__(self):
        return f"<Product(id={self.product_id}, name='{self.product_name}', ingredient='{self.active_ingredient}')>"


class Country(Base):
    """Country/market information"""
    __tablename__ = "countries"

    country_id = Column(Integer, primary_key=True, autoincrement=True)
    country_name = Column(String(100), nullable=False, unique=True)
    country_code = Column(String(3), unique=True)  # ISO 3166-1 alpha-3
    region = Column(String(100), nullable=False)  # e.g., "North America", "Europe"
    gdp = Column(Numeric(15, 2))  # GDP in billions USD
    population = Column(Integer)  # Population in millions
    healthcare_expenditure_pct = Column(Numeric(5, 2))  # % of GDP

    # Relationships
    sales = relationship("Sales", back_populates="country", cascade="all, delete-orphan")
    currency_rates = relationship("CurrencyConversionRate", back_populates="country")

    def __repr__(self):
        return f"<Country(id={self.country_id}, name='{self.country_name}', region='{self.region}')>"


class Channel(Base):
    """Distribution channel information"""
    __tablename__ = "channels"

    channel_id = Column(Integer, primary_key=True, autoincrement=True)
    channel_name = Column(String(100), nullable=False, unique=True)
    channel_type = Column(String(50))  # e.g., "Retail", "Hospital", "Online", "Wholesale"
    description = Column(String(500))

    # Relationships
    sales = relationship("Sales", back_populates="channel", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Channel(id={self.channel_id}, name='{self.channel_name}')>"


class Sales(Base):
    """Sales transaction data - fact table"""
    __tablename__ = "sales"

    sale_id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    channel_id = Column(Integer, ForeignKey("channels.channel_id"), nullable=False)
    date_id = Column(Integer, ForeignKey("date_dimensions.date_id"), nullable=True)
    
    year = Column(Integer, nullable=False)
    quarter = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    
    units_sold = Column(Integer, nullable=False)
    sales_value_usd = Column(Numeric(15, 2), nullable=False)
    sales_value_local = Column(Numeric(15, 2))
    local_currency = Column(String(3))
    
    cost_of_goods = Column(Numeric(15, 2))
    gross_margin = Column(Numeric(15, 2))

    # Relationships
    product = relationship("Product", back_populates="sales")
    country = relationship("Country", back_populates="sales")
    channel = relationship("Channel", back_populates="sales")
    date_dimension = relationship("DateDimension", back_populates="sales")

    # Constraints
    __table_args__ = (
        CheckConstraint("quarter >= 1 AND quarter <= 4", name="check_quarter"),
        CheckConstraint("month >= 1 AND month <= 12", name="check_month"),
        CheckConstraint("units_sold >= 0", name="check_units_positive"),
        CheckConstraint("sales_value_usd >= 0", name="check_sales_positive"),
        Index("idx_sales_product", "product_id"),
        Index("idx_sales_country", "country_id"),
        Index("idx_sales_date", "year", "quarter", "month"),
        Index("idx_sales_composite", "product_id", "country_id", "year", "quarter"),
    )

    def __repr__(self):
        return f"<Sales(id={self.sale_id}, product_id={self.product_id}, value=${self.sales_value_usd})>"


# ==================== OPTIONAL ENHANCEMENT TABLES ====================

class DateDimension(Base):
    """Date dimension for time-series analysis"""
    __tablename__ = "date_dimensions"

    date_id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False, unique=True)
    year = Column(Integer, nullable=False)
    quarter = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    month_name = Column(String(20))
    week = Column(Integer)
    day_of_year = Column(Integer)
    is_weekend = Column(Integer)  # 0 or 1

    # Relationships
    sales = relationship("Sales", back_populates="date_dimension")

    __table_args__ = (
        Index("idx_date", "date"),
        Index("idx_year_quarter", "year", "quarter"),
    )

    def __repr__(self):
        return f"<DateDimension(date='{self.date}', Q{self.quarter} {self.year})>"


class CurrencyConversionRate(Base):
    """Currency conversion rates for multi-currency support"""
    __tablename__ = "currency_conversion_rates"

    rate_id = Column(Integer, primary_key=True, autoincrement=True)
    country_id = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    currency_code = Column(String(3), nullable=False)  # e.g., "EUR", "JPY"
    date = Column(Date, nullable=False)
    rate_to_usd = Column(Numeric(10, 6), nullable=False)  # How many USD = 1 unit of local currency

    # Relationships
    country = relationship("Country", back_populates="currency_rates")

    __table_args__ = (
        Index("idx_currency_date", "currency_code", "date"),
        Index("idx_country_currency", "country_id", "currency_code"),
    )

    def __repr__(self):
        return f"<CurrencyRate(currency='{self.currency_code}', date='{self.date}', rate={self.rate_to_usd})>"


class MarketShare(Base):
    """Calculated market share metrics"""
    __tablename__ = "market_shares"

    market_share_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    atc_code = Column(String(7), ForeignKey("atc_classifications.atc_code"), nullable=False)
    year = Column(Integer, nullable=False)
    quarter = Column(Integer, nullable=False)
    
    total_market_value = Column(Numeric(15, 2), nullable=False)
    company_value = Column(Numeric(15, 2), nullable=False)
    market_share_pct = Column(Numeric(5, 2), nullable=False)
    rank = Column(Integer)

    __table_args__ = (
        Index("idx_market_share_composite", "company_id", "country_id", "year", "quarter"),
    )

    def __repr__(self):
        return f"<MarketShare(company_id={self.company_id}, share={self.market_share_pct}%)>"


# ==================== DATA GENERATION ====================

class MockIQVIADataGenerator:
    """Generates realistic mock data for IQVIA MIDAS database"""
    
    def __init__(self, session: Session):
        self.session = session
        
        # Realistic pharmaceutical data
        self.pharma_companies = [
            ("Pfizer Inc.", "United States", 1849, 1),
            ("Novartis AG", "Switzerland", 1996, 2),
            ("Roche Holding AG", "Switzerland", 1896, 3),
            ("Johnson & Johnson", "United States", 1886, 4),
            ("Merck & Co.", "United States", 1891, 5),
            ("GSK plc", "United Kingdom", 2000, 6),
            ("Sanofi S.A.", "France", 2004, 7),
            ("AbbVie Inc.", "United States", 2013, 8),
            ("AstraZeneca", "United Kingdom", 1999, 9),
            ("Bristol-Myers Squibb", "United States", 1887, 10),
        ]
        
        self.atc_classifications = [
            ("A02BC01", "Alimentary tract and metabolism", "Drugs for acid related disorders", "Proton pump inhibitors", "Omeprazole"),
            ("C09AA02", "Cardiovascular system", "ACE inhibitors", "Plain", "Enalapril"),
            ("N02BE01", "Nervous system", "Analgesics", "Anilides", "Paracetamol"),
            ("J01CR02", "Anti-infectives for systemic use", "Beta-lactam antibacterials", "Penicillins", "Amoxicillin"),
            ("A10BA02", "Alimentary tract and metabolism", "Drugs used in diabetes", "Biguanides", "Metformin"),
            ("C07AB03", "Cardiovascular system", "Beta blocking agents", "Selective", "Atenolol"),
            ("R03AC02", "Respiratory system", "Adrenergics for systemic use", "Beta2-agonists", "Salbutamol"),
            ("N05AH04", "Nervous system", "Antipsychotics", "Diazepines and oxazepines", "Quetiapine"),
            ("L01XE03", "Antineoplastic agents", "Protein kinase inhibitors", "Protein kinase inhibitors", "Erlotinib"),
            ("B01AC06", "Blood and blood forming organs", "Antithrombotic agents", "Platelet aggregation inhibitors", "Clopidogrel"),
        ]
        
        self.countries_data = [
            ("United States", "USA", "North America", 21427.7, 331900000, 17.1),
            ("Germany", "DEU", "Europe", 3846.4, 83200000, 11.7),
            ("China", "CHN", "Asia-Pacific", 14722.7, 1412000000, 5.4),
            ("Japan", "JPN", "Asia-Pacific", 5064.9, 125800000, 11.1),
            ("United Kingdom", "GBR", "Europe", 2827.1, 67220000, 10.2),
            ("France", "FRA", "Europe", 2716.7, 67390000, 11.3),
            ("India", "IND", "Asia-Pacific", 2875.1, 1380000000, 3.5),
            ("Brazil", "BRA", "Latin America", 1445.0, 212600000, 9.6),
            ("Canada", "CAN", "North America", 1736.4, 38010000, 11.5),
            ("Australia", "AUS", "Asia-Pacific", 1330.9, 25690000, 9.3),
        ]
        
        self.channels_data = [
            ("Retail Pharmacy", "Retail", "Community pharmacies and retail outlets"),
            ("Hospital Pharmacy", "Hospital", "Hospital-based pharmacies and inpatient care"),
            ("Online Pharmacy", "Online", "E-commerce and telemedicine platforms"),
            ("Wholesale", "Wholesale", "Bulk distribution to healthcare facilities"),
            ("Mail Order", "Mail Order", "Direct-to-consumer mail delivery"),
        ]
        
        self.dosage_forms = ["Tablet", "Capsule", "Injection", "Syrup", "Cream", "Inhaler", "Patch"]
        self.strengths = ["5mg", "10mg", "25mg", "50mg", "100mg", "250mg", "500mg", "1g"]
    
    def seed_companies(self, count: int = 10):
        """Generate pharmaceutical companies"""
        companies = []
        for i in range(min(count, len(self.pharma_companies))):
            name, country, year, rank = self.pharma_companies[i]
            company = Company(
                company_name=name,
                headquarters_country=country,
                founded_year=year,
                global_rank=rank
            )
            companies.append(company)
        
        self.session.add_all(companies)
        self.session.commit()
        print(f"✅ Created {len(companies)} companies")
        return companies
    
    def seed_atc_classifications(self):
        """Generate ATC classifications"""
        classifications = []
        for code, level1, level2, level3, level4 in self.atc_classifications:
            atc = ATCClassification(
                atc_code=code,
                atc_level1=level1,
                atc_level2=level2,
                atc_level3=level3,
                atc_level4=level4,
                description=f"{level4} - {level3}"
            )
            classifications.append(atc)
        
        self.session.add_all(classifications)
        self.session.commit()
        print(f"✅ Created {len(classifications)} ATC classifications")
        return classifications
    
    def seed_products(self, count: int = 20):
        """Generate pharmaceutical products"""
        companies = self.session.query(Company).all()
        atc_codes = self.session.query(ATCClassification).all()
        
        if not companies or not atc_codes:
            raise ValueError("Companies and ATC classifications must be created first")
        
        products = []
        for i in range(count):
            atc = random.choice(atc_codes)
            company = random.choice(companies)
            
            product = Product(
                product_name=f"{atc.atc_level4} {random.choice(['XR', 'SR', 'Plus', 'Max', 'Pro'])} {i+1}",
                active_ingredient=atc.atc_level4,
                dosage_form=random.choice(self.dosage_forms),
                strength=random.choice(self.strengths),
                atc_code=atc.atc_code,
                company_id=company.company_id,
                approval_date=fake.date_between(start_date="-15y", end_date="-1y"),
                patent_expiry=fake.date_between(start_date="today", end_date="+10y")
            )
            products.append(product)
        
        self.session.add_all(products)
        self.session.commit()
        print(f"✅ Created {len(products)} products")
        return products
    
    def seed_countries(self):
        """Generate country data"""
        countries = []
        for name, code, region, gdp, pop, healthcare_pct in self.countries_data:
            country = Country(
                country_name=name,
                country_code=code,
                region=region,
                gdp=gdp,
                population=pop,
                healthcare_expenditure_pct=healthcare_pct
            )
            countries.append(country)
        
        self.session.add_all(countries)
        self.session.commit()
        print(f"✅ Created {len(countries)} countries")
        return countries
    
    def seed_channels(self):
        """Generate distribution channels"""
        channels = []
        for name, channel_type, desc in self.channels_data:
            channel = Channel(
                channel_name=name,
                channel_type=channel_type,
                description=desc
            )
            channels.append(channel)
        
        self.session.add_all(channels)
        self.session.commit()
        print(f"✅ Created {len(channels)} channels")
        return channels
    
    def seed_date_dimensions(self, start_year: int = 2020, end_year: int = 2024):
        """Generate date dimension table"""
        dates = []
        start_date = datetime(start_year, 1, 1)
        end_date = datetime(end_year, 12, 31)
        
        current_date = start_date
        while current_date <= end_date:
            date_dim = DateDimension(
                date=current_date.date(),
                year=current_date.year,
                quarter=(current_date.month - 1) // 3 + 1,
                month=current_date.month,
                month_name=current_date.strftime("%B"),
                week=current_date.isocalendar()[1],
                day_of_year=current_date.timetuple().tm_yday,
                is_weekend=1 if current_date.weekday() >= 5 else 0
            )
            dates.append(date_dim)
            current_date += timedelta(days=1)
        
        self.session.add_all(dates)
        self.session.commit()
        print(f"✅ Created {len(dates)} date dimension records")
        return dates
    
    def seed_sales(self, count: int = 500):
        """Generate sales transaction data"""
        products = self.session.query(Product).all()
        countries = self.session.query(Country).all()
        channels = self.session.query(Channel).all()
        
        if not products or not countries or not channels:
            raise ValueError("Products, countries, and channels must be created first")
        
        sales = []
        years = [2020, 2021, 2022, 2023, 2024]
        
        for _ in range(count):
            year = random.choice(years)
            quarter = random.randint(1, 4)
            month = random.randint((quarter-1)*3 + 1, quarter*3)
            
            units = random.randint(100, 100000)
            unit_price = random.uniform(5.0, 500.0)
            sales_value = round(units * unit_price, 2)
            cost = round(sales_value * random.uniform(0.3, 0.7), 2)
            margin = round(sales_value - cost, 2)
            
            sale = Sales(
                product_id=random.choice(products).product_id,
                country_id=random.choice(countries).country_id,
                channel_id=random.choice(channels).channel_id,
                year=year,
                quarter=quarter,
                month=month,
                units_sold=units,
                sales_value_usd=sales_value,
                sales_value_local=round(sales_value * random.uniform(0.8, 1.2), 2),
                local_currency=random.choice(["USD", "EUR", "GBP", "JPY", "CNY"]),
                cost_of_goods=cost,
                gross_margin=margin
            )
            sales.append(sale)
        
        self.session.add_all(sales)
        self.session.commit()
        print(f"✅ Created {len(sales)} sales records")
        return sales
    
    def seed_currency_rates(self):
        """Generate currency conversion rates"""
        countries = self.session.query(Country).all()
        currency_map = {
            "USA": "USD", "DEU": "EUR", "CHN": "CNY", "JPN": "JPY",
            "GBR": "GBP", "FRA": "EUR", "IND": "INR", "BRA": "BRL",
            "CAN": "CAD", "AUS": "AUD"
        }
        
        # Base rates (approximate)
        base_rates = {
            "USD": 1.0, "EUR": 0.85, "CNY": 6.45, "JPY": 110.0,
            "GBP": 0.73, "INR": 74.5, "BRL": 5.25, "CAD": 1.25, "AUD": 1.35
        }
        
        rates = []
        for country in countries:
            currency = currency_map.get(country.country_code, "USD")
            base_rate = base_rates.get(currency, 1.0)
            
            # Generate rates for each quarter over 3 years
            for year in [2022, 2023, 2024]:
                for quarter in [1, 2, 3, 4]:
                    month = quarter * 3
                    date = datetime(year, month, 1).date()
                    rate = base_rate * random.uniform(0.95, 1.05)
                    
                    rate_record = CurrencyConversionRate(
                        country_id=country.country_id,
                        currency_code=currency,
                        date=date,
                        rate_to_usd=1.0 / rate if rate != 0 else 1.0
                    )
                    rates.append(rate_record)
        
        self.session.add_all(rates)
        self.session.commit()
        print(f"✅ Created {len(rates)} currency conversion rates")
        return rates
    
    def seed_market_shares(self):
        """Calculate and generate market share data"""
        # Query sales aggregated by company, country, ATC, year, quarter
        results = self.session.query(
            Product.company_id,
            Sales.country_id,
            Product.atc_code,
            Sales.year,
            Sales.quarter,
            func.sum(Sales.sales_value_usd).label("company_value")
        ).join(
            Product, Sales.product_id == Product.product_id
        ).group_by(
            Product.company_id,
            Sales.country_id,
            Product.atc_code,
            Sales.year,
            Sales.quarter
        ).all()
        
        # Calculate market totals
        market_totals = {}
        for row in results:
            key = (row.country_id, row.atc_code, row.year, row.quarter)
            if key not in market_totals:
                market_totals[key] = 0
            market_totals[key] += float(row.company_value)
        
        # Create market share records
        market_shares = []
        for row in results:
            key = (row.country_id, row.atc_code, row.year, row.quarter)
            total_market = market_totals[key]
            company_val = float(row.company_value)
            share_pct = (company_val / total_market * 100) if total_market > 0 else 0
            
            ms = MarketShare(
                company_id=row.company_id,
                country_id=row.country_id,
                atc_code=row.atc_code,
                year=row.year,
                quarter=row.quarter,
                total_market_value=total_market,
                company_value=company_val,
                market_share_pct=round(share_pct, 2)
            )
            market_shares.append(ms)
        
        # Assign ranks within each market segment
        market_shares.sort(key=lambda x: (x.country_id, x.atc_code, x.year, x.quarter, -x.market_share_pct))
        
        current_key = None
        rank = 0
        for ms in market_shares:
            key = (ms.country_id, ms.atc_code, ms.year, ms.quarter)
            if key != current_key:
                rank = 1
                current_key = key
            else:
                rank += 1
            ms.rank = rank
        
        self.session.add_all(market_shares)
        self.session.commit()
        print(f"✅ Created {len(market_shares)} market share records")
        return market_shares
    
    def seed_all(self):
        """Seed all tables with mock data"""
        print("\n🌱 Starting database seeding...\n")
        
        self.seed_companies(10)
        self.seed_atc_classifications()
        self.seed_countries()
        self.seed_channels()
        self.seed_products(20)
        self.seed_date_dimensions(2020, 2024)
        self.seed_sales(500)
        self.seed_currency_rates()
        self.seed_market_shares()
        
        print("\n✅ Database seeding completed successfully!")


# ==================== QUERY HELPERS ====================

class IQVIAQueryHelper:
    """Helper class for common analytics queries"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def total_sales_by_country(self) -> List:
        """Get total sales by country"""
        results = self.session.query(
            Country.country_name,
            Country.region,
            func.sum(Sales.sales_value_usd).label("total_sales"),
            func.sum(Sales.units_sold).label("total_units")
        ).join(
            Sales, Country.country_id == Sales.country_id
        ).group_by(
            Country.country_name,
            Country.region
        ).order_by(
            desc("total_sales")
        ).all()
        
        return results
    
    def top_products_by_sales(self, limit: int = 10) -> List:
        """Get top products by sales value"""
        results = self.session.query(
            Product.product_name,
            Product.active_ingredient,
            Company.company_name,
            func.sum(Sales.sales_value_usd).label("total_sales"),
            func.sum(Sales.units_sold).label("total_units")
        ).join(
            Sales, Product.product_id == Sales.product_id
        ).join(
            Company, Product.company_id == Company.company_id
        ).group_by(
            Product.product_name,
            Product.active_ingredient,
            Company.company_name
        ).order_by(
            desc("total_sales")
        ).limit(limit).all()
        
        return results
    
    def sales_by_channel(self) -> List:
        """Get sales breakdown by distribution channel"""
        results = self.session.query(
            Channel.channel_name,
            Channel.channel_type,
            func.sum(Sales.sales_value_usd).label("total_sales"),
            func.count(Sales.sale_id).label("transaction_count")
        ).join(
            Sales, Channel.channel_id == Sales.channel_id
        ).group_by(
            Channel.channel_name,
            Channel.channel_type
        ).order_by(
            desc("total_sales")
        ).all()
        
        return results
    
    def quarterly_trends(self, year: int) -> List:
        """Get quarterly sales trends for a specific year"""
        results = self.session.query(
            Sales.quarter,
            func.sum(Sales.sales_value_usd).label("total_sales"),
            func.sum(Sales.units_sold).label("total_units"),
            func.count(Sales.sale_id).label("transaction_count")
        ).filter(
            Sales.year == year
        ).group_by(
            Sales.quarter
        ).order_by(
            Sales.quarter
        ).all()
        
        return results
    
    def company_performance(self, limit: int = 10) -> List:
        """Get company performance ranking"""
        results = self.session.query(
            Company.company_name,
            Company.headquarters_country,
            Company.global_rank,
            func.sum(Sales.sales_value_usd).label("total_sales"),
            func.count(func.distinct(Product.product_id)).label("product_count")
        ).join(
            Product, Company.company_id == Product.company_id
        ).join(
            Sales, Product.product_id == Sales.product_id
        ).group_by(
            Company.company_name,
            Company.headquarters_country,
            Company.global_rank
        ).order_by(
            desc("total_sales")
        ).limit(limit).all()
        
        return results
    
    def atc_category_analysis(self) -> List:
        """Get sales analysis by ATC therapeutic category"""
        results = self.session.query(
            ATCClassification.atc_level1,
            ATCClassification.atc_level2,
            func.count(func.distinct(Product.product_id)).label("product_count"),
            func.sum(Sales.sales_value_usd).label("total_sales")
        ).join(
            Product, ATCClassification.atc_code == Product.atc_code
        ).join(
            Sales, Product.product_id == Sales.product_id
        ).group_by(
            ATCClassification.atc_level1,
            ATCClassification.atc_level2
        ).order_by(
            desc("total_sales")
        ).all()
        
        return results
    
    def market_share_leaders(self, country_name: str, year: int, quarter: int) -> List:
        """Get market share leaders for a specific country and time period"""
        results = self.session.query(
            Company.company_name,
            ATCClassification.atc_level1,
            MarketShare.market_share_pct,
            MarketShare.company_value,
            MarketShare.rank
        ).join(
            Company, MarketShare.company_id == Company.company_id
        ).join(
            Country, MarketShare.country_id == Country.country_id
        ).join(
            ATCClassification, MarketShare.atc_code == ATCClassification.atc_code
        ).filter(
            Country.country_name == country_name,
            MarketShare.year == year,
            MarketShare.quarter == quarter,
            MarketShare.rank <= 5
        ).order_by(
            ATCClassification.atc_level1,
            MarketShare.rank
        ).all()
        
        return results


# ==================== DATABASE INITIALIZATION ====================

def create_database(db_path: str = "mock_iqvia.db", echo: bool = False):
    """Create and initialize the database"""
    db_url = "postgresql://postgres:Arpon2022@db.lvvcipyrlorjlddiugec.supabase.co:5432/postgres"
    engine = create_engine(db_url, echo=echo)
    
    try:
        Base.metadata.create_all(engine)
        print(f"✅ Database initialized successfully on: {db_url}")
    except SQLAlchemyError as e:
        print("❌ Failed to initialize database:", e)
        raise

    return engine


def get_session(engine):
    """Get database session"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


# ==================== MAIN FUNCTION ====================

def main():
    """Main function to initialize and seed the database"""
    print("=" * 60)
    print("Mock IQVIA MIDAS Database Generator")
    print("=" * 60)
    
    # Create database
    db_path = "mock_iqvia.db"
    engine = create_database(db_path, echo=False)
    session = get_session(engine)
    
    try:
        # Generate mock data
        generator = MockIQVIADataGenerator(session)
        generator.seed_all()
        
        # Run sample queries
        print("\n" + "=" * 60)
        print("Sample Analytics Queries")
        print("=" * 60 + "\n")
        
        query_helper = IQVIAQueryHelper(session)
        
        # 1. Total sales by country
        print("\n📊 Total Sales by Country:")
        print("-" * 60)
        for country, region, sales, units in query_helper.total_sales_by_country()[:5]:
            print(f"{country:20} | {region:15} | ${sales:,.2f} | {units:,} units")
        
        # 2. Top products
        print("\n🏆 Top 5 Products by Sales:")
        print("-" * 60)
        for product, ingredient, company, sales, units in query_helper.top_products_by_sales(5):
            print(f"{product:30} | {company:20} | ${sales:,.2f}")
        
        # 3. Sales by channel
        print("\n🏪 Sales by Distribution Channel:")
        print("-" * 60)
        for channel, channel_type, sales, count in query_helper.sales_by_channel():
            print(f"{channel:25} | ${sales:,.2f} | {count:,} transactions")
        
        # 4. Company performance
        print("\n🏢 Top Companies by Sales:")
        print("-" * 60)
        for company, country, rank, sales, products in query_helper.company_performance(5):
            print(f"{company:30} | ${sales:,.2f} | {products} products")
        
        # 5. Quarterly trends for 2024
        print("\n📈 Quarterly Sales Trends (2024):")
        print("-" * 60)
        for quarter, sales, units, count in query_helper.quarterly_trends(2024):
            print(f"Q{quarter} 2024: ${sales:,.2f} | {units:,} units | {count:,} transactions")
        
        print("\n" + "=" * 60)
        print(f"✅ Database successfully created and seeded: {db_path}")
        print("=" * 60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
